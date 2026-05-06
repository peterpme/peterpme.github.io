---
title: React Native's Pressable mounts faster than Gesture Handler's
description: "A benchmarking investigation into why screens that mount many pressable components open slowly on Android, and what we found when we swapped implementations."
date: 2026-05-06T12:00:00.000Z
categories: React Native
---

We were trying to figure out why a bottom sheet in our app opened with a noticeable delay on Android. The sheet renders a list of chart indicators, and each row has up to three pressable elements. At roughly 34 rows, that's around 100 `BpPressable` instances mounting in the same frame.

The delay was real, reproducible, and worth fixing. So we set up a benchmark.

## The setup

We measured three time checkpoints relative to the button tap that opens the sheet:

- **render start**: the first time the bottom sheet component's function body runs
- **mounted**: the first `useEffect` with an empty dependency array fires, meaning the commit phase is done
- **painted**: a `requestAnimationFrame` callback after mount, roughly one frame after commit

Four implementations were tested. All on the same Android device, same modal, 10 rounds each.

**V1 PressableWorklet** was a reproduction of an older pattern: `Animated.createAnimatedComponent(Pressable)` where the Pressable comes from RNGH, with two `useSharedValue` instances and a `useAnimatedStyle` worklet driving scale and opacity.

**V2 GestureWorklet** is the current implementation in master: a `GestureDetector` wrapping an `Animated.View`, with one `useSharedValue`, two `useDerivedValue` calls, and a `useAnimatedStyle`. The press gesture is handled by `Gesture.Tap()`.

**V3 Vanilla** is the floor: plain `Pressable` from React Native, `onPressIn`/`onPressOut` wired to an inline style, no reanimated at all. The visual feedback is an instant opacity change with no easing.

**V4 CssApi** uses reanimated 4's CSS transition API: `createCSSAnimatedComponent(Pressable)` from `react-native-reanimated/css`, where the Pressable is the plain React Native one, with a `useState` for pressed state and `transitionProperty`, `transitionDuration`, `transitionTimingFunction` in the style. No worklets, no shared values. Under the hood, `createCSSAnimatedComponent` uses a completely separate component class from the regular reanimated one — it attaches a `CSSManager` that watches for style-prop changes and drives the animation through the CSS pipeline, not the worklet runtime.

## The results

| Variant | painted mean | painted median |
|---|---|---|
| V1 PressableWorklet | 760.7 ms | 712.9 ms |
| V2 GestureWorklet (master) | 778.5 ms | 760.6 ms |
| V3 Vanilla | 456.2 ms | 423.8 ms |
| V4 CssApi | 453.7 ms | 449.2 ms |

V3 and V4 are about 325 ms faster than the current implementation. That's not noise. The standard deviation across all variants is 40 to 120 ms, and the gap between the two clusters is three times larger.

## The surprising part

We expected worklets to be the culprit. V2 registers three worklets per instance (two `useDerivedValue`, one `useAnimatedStyle`) plus one shared value, compared to V1's two shared values and one worklet. More worklet registrations should mean a higher mount cost.

But V1 and V2 land on almost identical numbers. The 18 ms difference in painted means is well inside the noise. Whatever changed between the two worklet implementations doesn't matter at this scale.

The split is not worklets vs. no worklets. It's Gesture Handler vs. no Gesture Handler.

V1 and V2 both register a native gesture handler per instance. V1 uses RNGH's `Pressable`, V2 uses `GestureDetector`. Both cluster around 770 ms painted. V3 uses plain React Native `Pressable` with no animation, and V4 uses plain React Native `Pressable` with reanimated 4's CSS transition. Both cluster around 455 ms.

V4 is essentially V3 with smooth press animations, and they're statistically tied on speed. The painted means differ by 2.5 ms. V3's standard deviation was 61.5 ms, V4's was 106.7 ms, so V3 is slightly more consistent run-to-run — but V3 has no easing, just an instant opacity snap. V4 gets you the same mount speed with actual animation fidelity, which makes it the obvious pick.

## Why Gesture Handler adds mount cost

Each `GestureDetector` and each RNGH `Pressable` registers a native gesture handler on mount. On a screen that mounts 100 of them in a single frame, that's 100 native registrations happening during the commit phase. At small counts this is invisible. At 100 the latency accumulates and shows up as a visible delay before the sheet is interactive.

The plain React Native `Pressable` doesn't do this. It handles press state in a lighter way that doesn't involve registering per-instance native handlers, so 100 of them mount without the same overhead.

## What we shipped

We migrated to V4: `createCSSAnimatedComponent(Pressable)` from `react-native-reanimated/css`, using the plain React Native `Pressable`, with reanimated 4's `transitionProperty` driving the scale and opacity changes. The public API and animation contract are unchanged: same 0.98 scale, same 0.8 opacity, same 100 ms ease-out, same `reducedMotion` guard.

The migration has the same smooth animation feel as the old implementation with a painted time on the worst-case screen that went from 778 ms down to 453 ms.

If you have a screen that mounts many pressable elements at once and it feels slow to open, this is worth checking. The culprit probably isn't your animation logic.
