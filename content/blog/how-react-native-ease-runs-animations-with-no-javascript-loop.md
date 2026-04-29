---
title: How react-native-ease runs animations with no JavaScript loop
description: "A deep dive into how react-native-ease hands animations entirely to Core Animation on iOS and ObjectAnimator on Android, with zero per-frame JavaScript involvement."
date: 2026-04-29T06:00:00.000Z
categories: React Native
---

The [AppAndFlow](https://appandflow.com/) team released an amazing animation library called [react-native-ease](https://github.com/AppAndFlow/react-native-ease). Here's a deep dive into how it works under the hood.

Most React Native animation libraries work the same way under the hood: a JavaScript timer drives a value, that value crosses the bridge (or JSI) every frame, and the native view updates in response. It works, but animation fidelity is tied to the health of the JS thread. Drop a frame processing a list, and your animation stutters.

react-native-ease takes a different approach. Once you hand it a prop change, JavaScript is done. The animation runs entirely on the native side using Core Animation on iOS and ObjectAnimator and SpringAnimation on Android, with no JS involvement per frame.

Here's how it actually works.

## The JS layer does one thing: flatten props

The `EaseView` component is a pure render function. It takes structured props like this:

```tsx
<EaseView
  animate={{ opacity: 0.5, scale: 1.2 }}
  transition={{ type: 'spring', damping: 15, stiffness: 120 }}
/>
```

And flattens them into individual scalar native props:

```
animateOpacity=0.5
animateScaleX=1.2
animateScaleY=1.2
transitions.defaultConfig = { type:"spring", damping:15, stiffness:120, ... }
```

There's no `useEffect`, no `useRef`, no animation state. It's a prop resolver. The interesting part is the bitmask.

### The bitmask

React Native's codegen doesn't support nullable primitives cleanly. You can't send `null` for a `Float` prop. So when `opacity` isn't in your `animate` prop, JS still has to send *something* for `animateOpacity`. It sends the identity value: `1.0`.

But now native has a problem: it can't tell whether `animateOpacity: 1.0` means "the user animated opacity to 1" or "the user didn't animate opacity at all and this is just the default." Both look identical.

The solution is a single extra `Int32` prop called `animatedProperties`, where each bit flags one property:

```
bit 0 = opacity
bit 1 = translateX
bit 2 = translateY
bit 3 = scaleX
...
```

If opacity is in your `animate` prop, bit 0 is set. Native checks `mask & kMaskOpacity` before touching opacity at all. If the bit is off, native ignores the value completely and lets React Native's normal style system handle it. This lets both systems coexist on the same view without conflict.

## iOS: Core Animation key-path animations

The iOS native view (`EaseView.mm`) is a Fabric `RCTViewComponentView`. The main entry point is `updateProps:oldProps:`, which Fabric calls every time JS sends new props.

### Model layer vs. presentation layer

Core Animation maintains two parallel copies of every layer. The *model layer* is what your code sets and always holds the final target value. The *presentation layer* is what's actually visible on screen during an animation. They're separate objects.

This distinction is critical for smooth interruption. If the user triggers a new animation while one is already running, the code reads the current visual position from the presentation layer:

```objc
fromValue:[self presentationValueForKeyPath:@"opacity"]
```

If it read from the model layer instead, the interrupted animation would snap to the final value and restart from there. Reading from the presentation layer means the new animation starts from exactly wherever the view currently appears, making interruptions seamless.

### Why transforms use individual key-paths

All transform properties (scale, rotation, translation) could theoretically be combined into a single `CATransform3D` matrix and animated as one. The code explicitly does not do this, and for a good reason.

Core Animation interpolates matrices by decomposing them back into components. This decomposition is ambiguous in certain cases. A rotation from 0° to 360° produces the same matrix at both endpoints, so Core Animation sees no change and does nothing. A combined scale+rotation can decompose differently depending on the order of operations, producing unexpected visual results.

By animating individual key-paths like `"transform.rotation.z"`, `"transform.scale.x"`, and `"transform.translation.x"`, each component is interpolated as a plain scalar. 0 to 6.28 radians is unambiguous. The animations compose correctly on the layer without any matrix decomposition.

### The first mount problem

Enter animations (where `initialAnimate` differs from `animate`) can't fire immediately when `updateProps:` is called on first mount. At that point, Fabric hasn't finished laying out the view and its frame isn't set yet. Animating before layout is settled means animating from wrong coordinates.

So the code defers. It sets a flag in `updateProps:` and waits for `finalizeUpdates:` and `didMoveToWindow`, both of which fire after the view is fully laid out and attached to the window, before applying the enter animation.

### Reading the room: overriding invalidateLayer

Fabric has a method on `RCTViewComponentView` called `invalidateLayer`. It's called internally whenever Fabric needs to re-sync style props back onto the `CALayer`, things like `opacity`, `backgroundColor`, and `cornerRadius` after a layout pass. It's a reliable, consistent hook that fires exactly when you need it.

The challenge is that sync clobbers whatever the animation system put there. A background color mid-transition gets reset to the style value.

Rather than fighting the system, `EaseView` joins it. It overrides `invalidateLayer`, lets super do its job, then re-stamps the animated values:

```objc
- (void)invalidateLayer {
  [super invalidateLayer];
  // re-apply our animated values on top
}
```

Fabric tells you when the layer needs updating, so use that signal. It's a clean handshake between two systems that both want to own the same properties, and it works because the override respects the contract rather than trying to prevent Fabric from running at all.

## Android: ObjectAnimator, SpringAnimation, and some physics

The Android side uses `ObjectAnimator` for timing-based animations and `androidx.dynamicanimation.SpringAnimation` for physics springs. Getting them to match iOS behavior requires a few non-obvious steps.

### Props are batched, not applied immediately

On Android, `@ReactProp` setters in `EaseViewManager` don't trigger animations directly. They write to `pending*` fields on the view. Then `onAfterUpdateTransaction` flushes them all at once via `applyPendingAnimateValues()`.

This batching is essential. A single React render might change opacity, scale, and translateX simultaneously. Without batching, each `@ReactProp` setter would fire a separate animation decision. With batching, all three changes are seen together, just like how `updateProps:oldProps:` on iOS receives the full old and new props as a pair.

### Deriving the spring damping ratio

iOS's `CASpringAnimation` takes raw physical parameters: `damping` (friction coefficient), `stiffness`, and `mass`. Android's `SpringForce` takes a `dampingRatio`, a dimensionless 0-1 value where 1.0 means critically damped.

They're different quantities, but they describe the same physics. The conversion is:

```kotlin
dampingRatio = damping / (2 * sqrt(stiffness * mass))
```

This is the formula from classical harmonic oscillator mechanics. It means the same `damping`, `stiffness`, and `mass` values produce visually identical springs on both platforms even though the underlying APIs accept different inputs.

### Border radius via ViewOutlineProvider

Android has no direct equivalent of `CALayer.cornerRadius`. Instead, the library uses `ViewOutlineProvider`, a system API where you supply an outline shape, set `clipToOutline = true`, and the render system uses that outline for clipping and shadow rendering.

```kotlin
val animatedOutlineProvider = object : ViewOutlineProvider() {
    override fun getOutline(view: View, outline: Outline) {
        outline.setRoundRect(0, 0, view.width, view.height, _borderRadius)
    }
}
```

The outline provider reads `_borderRadius` dynamically and is invalidated every frame during animation. The library switches back to `ViewOutlineProvider.BACKGROUND` when border radius isn't being animated, so normal style-driven border radius still works when you're not touching it from `animate`.

### Camera distance normalization

For 3D rotations (`rotateX`, `rotateY`), Android's API takes a `cameraDistance` value that controls perspective. The conversion from the CSS `perspective` prop isn't a direct pass-through:

```kotlin
cameraDistance = density * density * perspective * sqrt(5)
```

The `sqrt(5)` factor matches a specific normalization React Native applies internally to make CSS perspective values visually consistent across screen densities. Without it, a `rotateY` on this view would look different from a `rotateY` on a standard React Native view at the same perspective value.

## The result

No JS animation loop. No worklets. No C++ runtime. When a prop change arrives at native, one of two things happens: a `CAAnimation` gets added to a `CALayer`, or an `ObjectAnimator` starts running. From that point, the render thread handles everything. The JS thread can be completely blocked and the animation continues uninterrupted.

The tradeoff is that the animatable property set is fixed. You can only animate what the native layer understands natively. But for the properties that matter most (opacity, transform, color, border radius), it's about as low-level as you can get in React Native without writing a custom renderer.
