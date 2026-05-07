---
title: "The hidden cost of React.Activity"
description: "React.Activity preserves state, but it also tears down and recreates Effects. In React Native, that trade can get expensive fast on heavy screens and list items."
date: 2026-05-07T12:00:00.000Z
categories: [React, React Native]
---

`React.Activity` sounds great at first.

You keep the UI around. You keep the state around. You hide a screen or subtree without paying the cost of throwing everything away and rebuilding it later.

That part is true.

The part people tend to miss is what happens to Effects.

When an `Activity` boundary becomes hidden, React preserves the child state, but it also cleans up the subtree's Effects and active subscriptions. When the boundary becomes visible again, React restores the old state and recreates those Effects.

That is a very different trade than "keep this mounted but invisible."

It's more like:

- keep the state
- stop the side effects
- start them all again later

If your app barely uses `useEffect`, maybe that trade is fine.

If your React Native screen is full of nested design-system components, subscriptions, measurements, observers, query consumers, atom consumers, and a bunch of `useEffect` plus `setState` patterns, the trade gets a lot more expensive.

## What `Activity` actually does

The React docs are pretty clear here:

- hidden content keeps its state
- hidden content still re-renders when props change, just at lower priority
- hidden content's Effects are destroyed
- those Effects are recreated when the boundary becomes visible again

So yes, `Activity` can help preserve ephemeral UI state. A tab can come back without losing form input, expanded sections, or scroll-related local state.

But it does **not** preserve the mounted effect lifecycle.

That detail matters more than it sounds.

## Why this gets weird in React Native

React Native apps tend to accumulate effect-shaped work naturally.

Not because everyone is writing bad code. Just because a lot of mobile behavior looks like this:

- subscribe to app state
- subscribe to keyboard events
- react to layout changes
- react to screen dimensions
- wire up analytics
- attach observers through design system hooks
- derive some local state after mount

This is normal React Native code.

The problem is what happens when a dense subtree comes back from an `Activity` boundary.

If a screen is built from a lot of nested themed components and each layer mounts a couple of Effects, showing that screen again can trigger a wave of:

- subscription setup
- observer setup
- effect cleanup reversal
- follow-up `setState`
- extra renders

That cost does not show up when you explain `Activity` as "state is preserved."

It shows up when the user taps back into the screen and it feels heavier than expected.

## The sneaky multiplier: `useEffect` plus `setState`

This is where things really start to compound.

React's own lint rules call out synchronous `setState` inside Effects because it forces an extra render pass. First React renders. Then the Effect runs. Then `setState` fires. Then React renders again.

One component doing this is usually not a big deal.

A complex screen doing it all at once is a different story.

Here's the kind of pattern that looks harmless:

```tsx
function Row({ item }) {
  const [formattedPrice, setFormattedPrice] = useState("")

  useEffect(() => {
    setFormattedPrice(formatPrice(item.price))
  }, [item.price])

  return <Text>{formattedPrice}</Text>
}
```

That work usually belongs in render:

```tsx
function Row({ item }) {
  return <Text>{formatPrice(item.price)}</Text>
}
```

Now imagine the first version repeated across a dense screen hidden behind `Activity`.

When the screen becomes visible again, you don't just "restore it." You recreate those Effects, retrigger that state work, and potentially pay for another round of rendering across the list.

## The ecosystem is full of this stuff

This is the part I wanted to sanity check before writing it down, because it's easy to overstate.

The broad claim holds: effect-backed lifecycle work is everywhere, but the details matter.

### TanStack Query

TanStack Query's React layer does use `useEffect`. For example, `useBaseQuery` applies observer options in an Effect, and `HydrationBoundary` also uses `useEffect`.

That does **not** mean "React Query is bad with Activity."

It means query observers participate in React lifecycle semantics like everything else. Hiding an `Activity` boundary can tear down effect-backed work in that subtree. Showing it can recreate it.

On a big data-heavy screen, that matters.

### Jotai

Jotai's `useAtomValue` uses `useEffect` to subscribe and unsubscribe from the store.

Again, this is not a criticism of Jotai. It's just a real part of the lifecycle cost. If a hidden subtree contains a lot of atom consumers, showing it again can mean a lot of resubscription work.

### Zustand

This is the one that needs precision.

Zustand's core React binding is based on `useSyncExternalStore`, not `useEffect`, so I would not lump Zustand core into the same bucket as Jotai here.

That said, many apps using Zustand still wrap store access with custom hooks, subscriptions, or effect-driven component logic. So `Activity` can still be expensive in a Zustand app. The cost just may not come from Zustand itself.

## The dense screen problem

This is where `Activity` can quietly move work into the worst possible place: the interaction path.

And to be clear, I don't think the scary case is usually "150 list items are all mounted at once." In a good React Native app, that list is probably virtualized with something like `FlatList`, FlashList, or Legend List.

The more realistic problem is a screen with a lot of nested design-system components. Think a settings screen, checkout flow, profile editor, or bottom sheet built out of themed wrappers, stacks, text components, separators, icons, form fields, focus handlers, and responsive helpers.

Each visible section can have some mix of:

- a query consumer
- an atom or store consumer
- measurement logic
- a visibility or analytics hook
- a local effect that derives state
- a design system hook that sets up observers or subscriptions

None of those are necessarily wrong on their own.

But when you hide the whole screen with `Activity`, you're signing up for a big coordinated reactivation event when it becomes visible again.

That means:

- local state is preserved
- every child Effect is recreated
- subscriptions come back
- observer wiring comes back
- effect-driven `setState` may run again
- large parts of the screen may render more than once

That is the hidden cost.

The danger is not that `Activity` is slow by definition.

The danger is that it can feel like a free performance optimization right up until you use it on a screen that was already leaning too hard on Effects.

## A more realistic React Native example

Imagine a tab screen or bottom sheet hidden behind `Activity`:

```tsx
<Activity mode={open ? "visible" : "hidden"}>
  <EditProfileSheet />
</Activity>
```

And inside it you have a lot of nested UI primitives from your design system. If you're using something like Tamagui, or any similar component system, that usually means a deep tree of themed wrappers and hooks before you even get to your product logic.

A leaf component might look roughly like this:

```tsx
function ProfileField({ user }) {
  const { width } = useWindowDimensions()
  const [layout, setLayout] = useState(null)

  const query = useQuery({
    queryKey: ["presence", user.id],
    queryFn: () => fetchPresence(user.id),
  })

  useEffect(() => {
    setLayout(computeLayout(width))
  }, [width])

  useEffect(() => {
    const sub = AppState.addEventListener("change", () => {
      trackProfileField(user.id)
    })

    return () => sub.remove()
  }, [user.id])

  return <Field user={user} layout={layout} presence={query.data} />
}
```

This is not absurd code. I've seen versions of this all over real apps.

Now multiply it across a dense screen with lots of nested wrappers and hidden hooks from your component library, and then hide the whole thing with `Activity`.

When the screen comes back, the state may still be there, but the effect work comes roaring back with it.

## When `Activity` is a good trade

I still think `Activity` is useful.

It's a good fit when:

- the subtree has meaningful local UI state worth preserving
- the subtree is not huge
- the Effects inside it are cheap to recreate
- the user is likely to come back soon
- remounting the whole thing would be worse

Forms, smaller detail panes, and some tab content are all reasonable candidates.

## When to be careful

I would slow down if the subtree has:

- lots of nested design-system components
- effects attached throughout the component tree
- repeated subscriptions across leaf components
- design system hooks that attach observers
- lots of effect-driven local state
- expensive setup work on mount

That's the exact combination where `Activity` can preserve the part you wanted while also recreating a lot of the work you were hoping to avoid.

## The practical takeaway

Before wrapping a big React Native screen in `Activity`, audit the subtree.

Look for:

- `useEffect` that immediately calls `setState`
- mount-only logic inside leaf components
- repeated subscriptions that could move up the tree
- repeated measurement or observer setup
- expensive hooks hiding inside design system components

If that screen is already effect-heavy, `Activity` might not be reducing work. It might just be moving the work from initial mount into the moment the user comes back.

And that is usually a worse place to pay for it.

`Activity` preserves state. That's the feature everyone notices.

What it really tests is your effect hygiene.

If showing a hidden subtree feels like a remount storm, that's because in one important way, it is.
