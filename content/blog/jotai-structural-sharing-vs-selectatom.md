---
title: Structural sharing, selectAtom, and why your jotai atoms re-render too much
description: "When Object.is isn't enough, when selectAtom is a trap, and how to recreate React Query's structural sharing in plain jotai so plain derived atoms keep working."
date: 2026-05-15T12:00:00.000Z
categories: [Jotai, React]
---

I was benchmarking [`jotai-tanstack-query`](https://github.com/jotaijs/jotai-tanstack-query) against vanilla `useQuery` last week and watched a component commit 44× more times under no-op refetches than its React Query equivalent. Same query, same response, same render output, just a lot more React work. The cause is a single mechanical thing about how jotai compares atom values, and the fix is a question I keep seeing teams answer with `selectAtom` when they shouldn't.

This post is about that mechanic, when `selectAtom` is the right answer, and when it isn't.

## The mechanic

Jotai propagates derived atom values to subscribers when the new value differs from the previous one by `Object.is`. That's it. There's no shallow compare, no structural compare, and no way to swap in a custom comparator on a plain `atom(g => ...)`.

So this works perfectly for primitives:

```ts
const countAtom = atom((g) => g(cartAtom).items.length)
```

`length` is a number. If two consecutive reads return `7`, jotai skips the notify. Free.

And it works for *stable object references*:

```ts
const userAtom = atom((g) => g(rawAtom).user)
```

If `rawAtom`'s value preserves `user` as the same reference across updates, jotai sees `Object.is` true and skips. Also free.

It falls apart the moment your read **constructs a fresh value** every time:

```ts
const summaryAtom = atom((g) => ({
  count: g(cartAtom).items.length,
  total: sum(g(cartAtom).items),
}))
```

That object literal is new on every read. `Object.is({...}, {...})` is `false`. Every notify of `cartAtom` re-renders every consumer of `summaryAtom`, even if `count` and `total` didn't change.

The same problem hits the `jotai-tanstack-query` benchmark. The underlying atom holds the full `QueryObserverResult`, and TanStack builds a fresh envelope for every observer notify, including no-op refetches. Jotai sees a new object, fires the subscriber, React commits. 44× more than `useQuery`, which subscribes to the underlying QueryObserver and pulls out just the fields the component reads.

## The reflexive fix: `selectAtom`

`selectAtom(source, selector, equalityFn = Object.is)` from `jotai/utils` is the read-side dedupe primitive. It stores the previously selected value, runs `equalityFn(prev, next)` on each upstream notify, and if equal returns the **old reference** so the downstream `Object.is` check passes.

For the summary case:

```ts
import { selectAtom } from 'jotai/utils'
import { shallow } from 'jotai/utils'

const summaryAtom = selectAtom(
  cartAtom,
  (cart) => ({ count: cart.items.length, total: sum(cart.items) }),
  shallow,
)
```

That works. But it's almost never the right move. The cleaner version is two derived atoms:

```ts
const countAtom = atom((g) => g(cartAtom).items.length)
const totalAtom = atom((g) => sum(g(cartAtom).items))
```

Both primitives. Both free under `Object.is`. A consumer reads both with two `useAtomValue` calls and re-renders only when one of them actually changes. No `selectAtom`, no `shallow`, no equality function to maintain.

The general rule: **if your projection returns a primitive or a reference that already exists in the source, plain derived atom. If it constructs a new wrapper, split the projection into multiple primitive atoms.** `selectAtom` is the fallback for when you genuinely can't.

## When `selectAtom` actually pays

Two cases where splitting doesn't help and `selectAtom + shallow` is the real fix:

**`.filter` / `.map` over a list.** New array every time, even if every element is reference-stable:

```ts
const activeIdsAtom = selectAtom(
  usersAtom,
  (users) => users.filter((u) => u.active).map((u) => u.id),
  shallow,
)
```

There's no "split" version of this. You need a dedupe hook, and `shallow` is what gives it to you.

**Aggregates whose identity matters downstream.** If the consumer passes the projection to a memoized child or a context, you genuinely need the wrapper to keep its identity when the contents haven't changed. Even then, often the better answer is `useMemo` at the call site over individual atom reads, but `selectAtom + shallow` is legitimate.

That's it. Two cases. Everything else, prefer the split.

## The case `selectAtom` doesn't solve

Now back to the original problem. The reason `jotai-tanstack-query` commits 44× more than `useQuery` is that the *source atom* (the one holding the `QueryObserverResult`) emits a fresh object on every observer notify. You can wrap every consumer in `selectAtom` and you'll fix the read site, but you'll have paid for it N times for N subscribers, and you'll have written `selectAtom` everywhere.

The actual fix is upstream. React Query already does it internally: it has a feature called **structural sharing** (`structuralSharing: true`, default-on), which runs a `replaceEqualDeep` walk over the new response against the previous one. Unchanged subtrees keep their old references. Changed subtrees get the new ones. The result is that downstream consumers see stable references for the parts of the tree they care about, and `Object.is` is enough to dedupe everything.

You can recreate this in plain jotai without `selectAtom` anywhere:

```ts
function atomWithStructuralSharing<T>(initial: T) {
  const inner = atom(initial)
  return atom(
    (g) => g(inner),
    (g, s, next: T) => s(inner, replaceEqualDeep(g(inner), next) as T),
  )
}
```

The interceptor on `set` walks the previous value against the new one and splices old references in wherever they're structurally equal. After that, every plain derived atom downstream, like `atom(g => g(users)[3].name)`, `atom(g => g(users).filter(u => u.active))` (still a fresh array, see above), or `atom(g => g(users).length)`, gets the benefit for free.

A minimal `replaceEqualDeep` is about thirty lines; TanStack's lives in `@tanstack/query-core` and handles the tricky cases (class instances, Dates) you'll want to copy if you go this route.

## Decompose first, share second

Before you reach for `atomWithStructuralSharing`, ask whether you can decompose the atom into smaller atoms instead. Structural sharing is a real tool, but it only earns its keep on a specific shape of state. Walk the shapes:

**Primitive atom.** `Object.is` works. Nothing to do.

**Object atom with named fields.** Derive per-field atoms:

```ts
const userAtom = atom({ name: '', email: '', age: 0 })
const nameAtom = atom((g) => g(userAtom).name)
const emailAtom = atom((g) => g(userAtom).email)
```

The leaves are primitives. Dedupe is free. Even if you replace the whole object literal on every update, only consumers of changed fields re-render. `atomWithStructuralSharing` would buy nothing here.

**List atom.** This is where decomposition breaks down: cardinality is dynamic, you can't hand-write `row0Atom`, `row1Atom`. There are three real options:

1. **One list atom, no sharing.** Simplest. Every update re-renders every consumer that subscribes to the list (or any derived atom over it that doesn't resolve to a primitive). Fine for small lists or lists with few subscribers.

2. **One list atom + structural sharing.** Convenient writes (`set(usersAtom, newList)`), pays a `replaceEqualDeep` walk on every update. Row-level derived atoms (`atom(g => g(usersAtom)[3])`) get reference stability, and only the rows that actually changed propagate to subscribers. This is what React Query does internally.

3. **Ids array + `atomFamily` keyed by id.** The normalized-store approach:

   ```ts
   const userIdsAtom = atom<string[]>([])
   const userByIdAtom = atomFamily((id: string) => atom<User | null>(null))
   ```

   Order and membership live in the ids array. Each row is its own atom. Updates are surgical (`set(userByIdAtom(id), nextRow)`), no walker needed, no walk cost. The cost is that your data layer has to normalize. If you got a list back from a server, you have to fan it out yourself: write the ids array, write each row's atom. You also manage `atomFamily` lifecycle (call `.remove(id)` when rows are dropped, or accept the retained entries).

The trade-off across the three: option 1 is the smallest amount of code and the most re-renders; option 2 buys row-level dedupe in exchange for a per-write walk; option 3 buys surgical updates in exchange for a normalized data layer.

If you're already using React Query, option 2 is free — RQ does it for you and you write list atoms naturally. If you're feeding atoms from sockets or hand-rolled fetches, option 3 is often the cleaner long-term shape because it pushes the dedupe into the atom graph itself instead of into a walker that runs on every write.

## Why jotai doesn't ship this

Two reasons, I think.

First, atoms are intentionally a minimal primitive. A built-in structural-sharing walker would have to take a stance on plain objects vs class instances vs Dates vs Maps vs Sets, and impose a per-write cost on every consumer, even ones holding primitives or values that change once a minute. That's the wrong default for a library whose pitch is "smaller than Recoil."

Second, the right answer depends entirely on your data layer. If your source is React Query, RQ already does it. If your source is a WebSocket pushing JSON snapshots, you want `replaceEqualDeep` at the ingest point. If your source is a Zustand-style store, you want it in the setter. There's no single hook jotai can offer that fits all of them, but the composition (`atomWithStructuralSharing`, or an `atomEffect`, or just doing it in your update function) is two lines and lives where the data actually enters your app.

So `selectAtom` is the read-side primitive for when you can't fix the source. Structural sharing is the write-side discipline for when you can. Most teams reach for the first when they should be doing the second.

## The one rule that mattered for the benchmark

If you're consuming `jotai-tanstack-query`, never `useAtomValue(rawQueryAtom)` directly. Derive the field you actually read.

That's what turned 44× into 1× in the benchmark. One derived atom in the way, and jotai gets an `Object.is` it can actually use.
