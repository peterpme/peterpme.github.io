---
title: What's actually happening inside Legend List
description: "An interactive simulator showing how Legend List decides what to render, how many containers to create, and where the scroll buffer zones land."
date: 2025-04-29T12:00:00.000Z
---

I've been working on [Legend List](https://github.com/LegendApp/legend-list) and kept running into the same questions. How many containers does it actually create? Why does fast scrolling sometimes show blank space? Where exactly does it stop rendering items?

The answers are all in a small set of formulas that run on every scroll event. So I built a simulator that lets you poke at them directly.

[Open the Legend List Engine Simulator](/legend-list-simulator/)

## The three props worth understanding

`estimatedItemSize` is your best guess at the average item height. It feeds directly into how many containers get allocated at startup. Get it too low and you'll create more containers than you need. Get it way off and you'll see blank flashes during fast scrolls.

`drawDistance` is how far outside the visible viewport Legend List pre-renders items. The engine doesn't split that budget evenly though. It allocates 1.5x in the direction you're scrolling and only 0.5x behind you. Flip the scroll direction in the simulator and you can watch the buffer zones shift sides in real time.

`initialContainerPoolRatio` is a multiplier on top of that. Those extra containers sit idle but they're pre-created React components, ready to activate the moment something scrolls into range without triggering a new render. That's what the container pool column in the simulator is showing you.

## The formula

```
numContainers = ceil(
  ((viewportHeight - headerSize + drawDistance × 2) / avgItemSize) × numColumns
)
```

Drag `drawDistance` up and watch `numContainers` climb. Add columns and it multiplies. Increase `estimatedItemSize` and it drops. Everything in the simulator feeds into this.

There's also a `maxVisibleArea` cutoff, which sits 1000px past the bottom buffer. Items beyond that aren't positioned at all. That's what keeps things fast on long lists.

The formulas in the simulator match the real source in [doInitialAllocateContainers.ts](https://github.com/LegendApp/legend-list/blob/main/src/core/doInitialAllocateContainers.ts) and [calculateItemsInView.ts](https://github.com/LegendApp/legend-list/blob/main/src/core/calculateItemsInView.ts).
