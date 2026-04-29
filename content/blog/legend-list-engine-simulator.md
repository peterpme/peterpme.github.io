---
title: How Legend List decides what to render
description: "An interactive simulator that shows exactly how Legend List allocates containers, sizes scroll buffers, and decides which items are visible — all from the real engine formulas."
date: 2025-04-29T12:00:00.000Z
---

When I first started optimizing [Legend List](https://github.com/LegendApp/legend-list), a lot of the internal behavior felt opaque. How many containers does it actually create? Why does scrolling fast sometimes show blank space? Where exactly does it stop rendering items?

The answers are all in the engine — a small set of formulas that run on every scroll event. So I built a simulator that lets you poke at them directly.

**[Open the Legend List Engine Simulator →](/legend-list-simulator/)**

## What it shows

The simulator has three inputs worth understanding:

**`estimatedItemSize`** — your best guess at the average item height. This feeds directly into how many containers get allocated at startup. Smaller estimate → more containers. Get this wrong and you either waste memory or see blank flashes.

**`drawDistance`** — how far outside the visible viewport Legend List pre-renders items. The engine allocates more buffer in the direction you're scrolling (1.5×) and less behind you (0.5×). You can flip the scroll direction in the simulator and watch the amber buffer zones shift sides.

**`initialContainerPoolRatio`** — multiplier on top of the active container count. Those extra containers sit idle (shown in gray in the pool panel) but are pre-created React components, ready to activate instantly when items scroll into range without triggering a new render.

## The core formula

```
numContainers = ceil(
  ((viewportHeight - headerSize + drawDistance × 2) / avgItemSize) × numColumns
)
```

Every slider in the simulator feeds into this. Drag `drawDistance` up and watch `numContainers` climb. Add columns and it multiplies. Increase `estimatedItemSize` and it drops.

The simulator also shows `maxVisibleArea` — a hard cutoff 1000px past the bottom buffer beyond which items aren't even positioned. This is what keeps the engine fast on lists with thousands of items.

---

The simulator is a single HTML file with no dependencies. All the formulas match the actual source in [`src/core/doInitialAllocateContainers.ts`](https://github.com/LegendApp/legend-list/blob/main/src/core/doInitialAllocateContainers.ts) and [`src/core/calculateItemsInView.ts`](https://github.com/LegendApp/legend-list/blob/main/src/core/calculateItemsInView.ts).
