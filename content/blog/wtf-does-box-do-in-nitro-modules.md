---
title: WTF does .box() do in Nitro Modules?
description: "A ground-up explanation of why NitroModules.box() and .unbox() exist, what they're doing in C++, and why you need them to use HybridObjects across worklet runtimes."
date: 2026-05-11T06:00:00.000Z
categories: React Native
---

I was reading through the source of [react-native-nitro-fetch](https://github.com/margelo/react-native-nitro-fetch) and hit this inside `nitroFetchOnWorklet`:

```ts
return await runOnRuntimeAsync(rt, () => {
  'worklet';
  const unboxedNitroFetch = boxedNitroFetch.unbox();
  const unboxedClient = unboxedNitroFetch.createClient();
  const request = buildNitroRequestPure(input, init);
  const res = unboxedClient.requestSync(request);
  // ...
});
```

And up at the top of the module:

```ts
export const boxedNitroFetch = NitroModules.box(NitroFetch);
```

I had no idea what `box` and `unbox` were. They sound like they should be obvious but nothing clicked. Here's what they actually are, from the source up.

## Where setNativeState comes from

Before getting into box and unbox, it helps to know where `setNativeState` actually comes from, because it's the root of the whole problem.

`setNativeState` is part of JSI, the engine-agnostic C++ interface that sits between React Native and the JS engine. JSI is what lets React Native swap between Hermes and JSC without rewriting every native module. Hermes supported this API before JSC did, but the API you call from native code is a JSI API.

JSC didn't support it until late 2023. Before that, the JSC implementation literally threw `std::logic_error("Not implemented")` if you tried to call it. Third-party library authors were hitting 2-4x performance regressions because they had to fall back to the slower `HostObject` approach on JSC. React Native's own internals didn't roll it out internally until October 2023.

Nitro uses `NativeState` as the foundation for `HybridObject`. It didn't create the API. It built its object model around it.

## What a HybridObject is made of

A Nitro `HybridObject` is a C++ object exposed to JavaScript through JSI. In JSI, it's represented as two things glued together:

1. A **prototype chain**: the JS methods like `createClient`, `requestSync`, etc.
2. A **`jsi::NativeState`** pointer: the actual C++ instance, attached directly to the JS object

You can see this in `HybridObject.cpp`:

```cpp
jsi::Value HybridObject::toObject(jsi::Runtime& runtime) {
  // Get the object's base prototype (global & shared)
  jsi::Value prototype = getPrototype(runtime);

  // Create the object using Object.create(...)
  jsi::Object object = CommonGlobals::Object::create(runtime, prototype);

  // Assign NativeState to the object so the prototype can resolve the native methods
  object.setNativeState(runtime, shared());

  return object;
}
```

`setNativeState` attaches a C++ pointer to a JS object. When JS calls a method on that object, JSI looks up the `NativeState` pointer and dispatches the call to the right C++ method. It's clean, fast, and type-safe.

But the JS object that holds that `NativeState` belongs to the specific `jsi::Runtime` that created it. The underlying C++ object can be reused, but the JS wrapper cannot just be picked up and dropped into another runtime.

## The worklet runtime problem

`createWorkletRuntime` from `react-native-worklets` spins up a completely separate JS engine instance. Its own `jsi::Runtime`, its own heap, its own global object. When you call `runOnRuntimeAsync(rt, () => { 'worklet'; ... })`, that closure executes in a different engine than the one your React app runs in. They're isolated.

If you try to close over a `HybridObject` directly in a worklet closure, the worklets library has to serialize it and recreate something equivalent in the worklet runtime. Historically, that was the problem. A Nitro `HybridObject` is not a plain object. It has a custom prototype chain and a `NativeState`-backed JS wrapper. Worklet libraries knew how to move simpler values and `HostObject`s around, but not this exact shape.

So you can't just do this:

```ts
// This doesn't work
const myFetch = NitroFetchSingleton;

runOnRuntimeAsync(rt, () => {
  'worklet';
  myFetch.createClient(); // myFetch's NativeState belongs to the main runtime
});
```

## What box() actually does

`NitroModules.box()` converts a `HybridObject` from the newer `jsi::NativeState` representation into an older, simpler one: a `jsi::HostObject`.

`HostObject` is JSI's original escape hatch for native interop. You implement a `get()` method in C++, and JSI calls it whenever JavaScript accesses a property. `HostObject` does not use `NativeState`. It's a plain C++ virtual interface that the worklet serializer already knows how to move across runtimes.

Here's the entire `BoxedHybridObject` class from Nitro's source:

```cpp
class BoxedHybridObject final : public jsi::HostObject {
public:
  explicit BoxedHybridObject(const std::shared_ptr<HybridObject>& hybridObject)
    : _hybridObject(hybridObject) {}

public:
  jsi::Value get(jsi::Runtime& runtime, const jsi::PropNameID& propName) override;
  std::vector<jsi::PropNameID> getPropertyNames(jsi::Runtime& runtime) override;

private:
  std::shared_ptr<HybridObject> _hybridObject;
};
```

That's it. A thin wrapper holding a `std::shared_ptr` to the real C++ object. The `shared_ptr` is plain heap memory. It has nothing to do with any JS runtime. It's a reference-counted pointer that lives in C++ land, not in JSI land.

And `unbox` is the only property exposed:

```cpp
jsi::Value BoxedHybridObject::get(jsi::Runtime& runtime, const jsi::PropNameID& propName) {
  if (jsi::PropNameID::compare(runtime, propName, PropNameIDCache::get(runtime, "unbox"))) {
    return jsi::Function::createFromHostFunction(
        runtime, PropNameIDCache::get(runtime, "unbox"), 0,
        [hybridObject = _hybridObject](jsi::Runtime& runtime, ...) -> jsi::Value {
          return hybridObject->toObject(runtime);
        });
  }
  return jsi::Value::undefined();
}
```

When `.unbox()` is called, it calls `hybridObject->toObject(runtime)`, passing in the new runtime. That's the same `toObject` from earlier, which calls `setNativeState` on the current runtime. The result is a fully wired `HybridObject` rooted in the worklet runtime, backed by the same C++ instance.

`box` and `unbox` were added to Nitro in a single commit in September 2024, titled explicitly: "Add NitroModules.box(...) to support using Nitro Modules from any Runtime/Worklets context." Worklets were the entire reason it was built.

## The full flow

![Box and unbox flow diagram](../assets/nitro-box-unbox-flow.png)

The C++ object is never copied. The `shared_ptr` just gets a new JS wrapper pointing at it, created fresh in the worklet runtime.

## Why this also needs buildNitroRequestPure

There's a second wrinkle: worklets have a restricted JS environment. `instanceof` doesn't work across runtimes. The `Headers` class from the main runtime doesn't exist in the worklet. No `Blob`, no `FormData`, no async APIs.

So `buildNitroRequestPure` (note the `Pure` suffix) is a worklet-safe version of the normal request builder. It avoids `instanceof` in favor of `Object.prototype.toString.call()`, uses `Object.keys()` instead of `Object.entries()`, and throws explicitly if you pass a body type it can't handle synchronously:

```ts
function buildNitroRequestPure(input, init) {
  'worklet';
  // uses Object.prototype.toString.call() not instanceof
  // uses Object.keys() not Object.entries()
  // throws on FormData/Blob, no async resolution in worklets
}
```

The `'worklet'` directive tells the worklet compiler to bundle this function into the worklet runtime's code. Functions without it can't be called from a worklet closure.

## Is this still necessary?

This is where it gets interesting, because nitro-fetch is not an old codebase. The manual `box`/`unbox` call was introduced in March 2026, not during the first Nitro worklets experiments in 2024.

Yet the manual `box`/`unbox` is still there. The reason is subtle.

When that code first landed, nitro-fetch depended on `react-native-worklets-core`. Nitro's automatic worklets support targets `react-native-worklets`, where it registers custom serialization with `registerCustomSerializable`. That does not help `react-native-worklets-core`.

The code later migrated to `react-native-worklets`, but the explicit box stayed. That makes sense. `box`/`unbox` is the public documented path that works with any worklet runtime that can carry a `HostObject`. It also avoids relying on whether custom serialization is installed, which worklets package is being used, or which exact runtime path is executing.

`nitroFetchOnWorklet` also does not run on the standard UI worklet context. It spins up its own named background runtime:

```ts
nitroRuntime = createWorkletRuntime('nitro-fetch')
```

Modern `react-native-worklets` does have custom serialization support, and it does load registered custom serializers into worklet runtimes. Nitro hooks into that by registering a `nitro.HybridObject` serializer that boxes during `pack` and unboxes during `unpack`.

But manual boxing is still the least surprising thing here. The code boxes one singleton once, captures the boxed `HostObject`, and unboxes it inside the runtime that needs to use it. No serializer magic required.

So the answer is: the automation exists, but this code still has a good reason to stay explicit.

For the standard case, closing over a `HybridObject` in a regular `react-native-worklets` worklet, Nitro's custom serializer should be able to handle it. But nitro-fetch is a library, not an app screen. It has to be more conservative, and the explicit `box`/`unbox` path is exactly what Nitro documents for cross-runtime usage.

Nitro's original docs for that September 2024 commit said:

> "In future versions of react-native-worklets-core or react-native-reanimated we expect fully automatic jsi::NativeState support, which will make boxing obsolete."

That future is arriving in pieces. The mechanism is the same `HostObject` wrapper and `shared_ptr` trick either way. Sometimes you call it yourself. Sometimes the serializer calls it for you.

## The timeline

- **Hermes first, JSI API**: `NativeState` becomes the JSI way to attach C++ state to JS objects
- **JSC late 2023**: JSC finally implements `setNativeState` (it was throwing "Not implemented" before this)
- **October 2023**: React Native rolls out `NativeState` in its own internals
- **September 2024**: Nitro adds `box`/`unbox` as a manual worklet workaround
- **Later worklets releases**: `registerCustomSerializable` gives worklets a hook for custom types
- **Nitro later**: Nitro uses that hook for `react-native-worklets` by registering `nitro.HybridObject`
- **nitro-fetch March 2026**: nitro-fetch still uses explicit `box`/`unbox`, which keeps the code compatible with the documented cross-runtime path

The `HostObject` is the passport. The `shared_ptr` is the actual traveler.
