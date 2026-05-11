---
title: WTF does .box() do in Nitro Modules?
description: "A ground-up explanation of why NitroModules.box() and .unbox() exist, what they're doing in C++, and why you need them to use HybridObjects across worklet runtimes."
date: 2026-05-11T06:00:00.000Z
categories: React Native
---

I was reading through the source of [react-native-nitro-fetch](https://github.com/peterpme/react-native-nitro-fetch) and hit this inside `nitroFetchOnWorklet`:

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

## What a HybridObject is made of

A Nitro `HybridObject` is a C++ object exposed to JavaScript through JSI, React Native's C++ engine interface. In JSI, it's represented as two things glued together:

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

`setNativeState` is the key line. It's a relatively newer JSI API that attaches an arbitrary C++ pointer to a JS object. When JS calls a method on that object, JSI looks up the `NativeState` pointer and dispatches the call to the right C++ method. It's clean, fast, and type-safe.

But it has one critical constraint: that `NativeState` is bound to the specific `jsi::Runtime` that created it. It is not portable.

## The worklet runtime problem

`createWorkletRuntime` from `react-native-worklets` spins up a completely separate JS engine instance. Its own `jsi::Runtime`, its own heap, its own global object. When you call `runOnRuntimeAsync(rt, () => { 'worklet'; ... })`, that closure executes in a different engine than the one your React app runs in. They're isolated.

If you try to close over a `HybridObject` directly in a worklet closure, the worklets library has to serialize it and copy it from the main runtime into the worklet runtime. But it doesn't know how to handle `jsi::NativeState`. The `HybridObject` has a custom prototype chain and a native state pointer that is meaningless in another engine's address space. The library either drops it silently or crashes.

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

## The full flow

```
Main JS Runtime                      Worklet Runtime
─────────────────────────────────    ──────────────────────────────────
NitroFetch singleton
  [JS object]
  └── jsi::NativeState ──────────►  C++ NitroFetch instance (heap)
                                              ▲
NitroModules.box(singleton)                   │ std::shared_ptr
  [BoxedHybridObject HostObject]              │
  └── shared_ptr ──────────────────────────── ┘
       │
       │  (HostObject: serializable across runtimes)
       ▼
                                     boxedNitroFetch lands here
                                     .unbox()
                                       └── toObject(workletRuntime)
                                           └── setNativeState(...)  ← new binding
                                     unboxedNitroFetch.createClient()  ✅
```

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

## Is this a common pattern?

Not by the name "box/unbox." But the concept has analogues:

- **`Transferable` in Web Workers**: `ArrayBuffer` can't be shared between workers but can be transferred. Same idea. Use an explicit handoff mechanism instead of trying to copy the raw object.
- **`Arc<Mutex<T>>` in Rust**: the wrapper is what gets moved across threads, not the inner value directly.
- **Structured clone in workers**: browsers serialize objects to cross worker boundaries. Box/unbox is the same concept but for native C++ objects where serialization isn't possible, so you pass the pointer wrapper instead.

The reason you haven't seen it elsewhere: it's a narrow problem that only exists at the intersection of JSI's `NativeState` API, multi-runtime worklets, and a library that uses the newer JSI APIs. Nitro predates worklet libraries having native support for `NativeState` objects, so `box`/`unbox` is the shim that bridges the gap.

The `HostObject` is the passport. The `shared_ptr` is the actual traveler.
