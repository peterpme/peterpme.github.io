---
title: "Frameworks aren't going away. Glue code is."
description: "Agents write more code than ever, and that makes React, Postgres and Redis more valuable, not less. What dies is the boilerplate in between."
date: 2026-11-03T06:00:00.000Z
categories: AI
draft: true
---

Every few weeks someone tells me frameworks are going away. Agents will just write bespoke code for every app, so who needs React? Who needs a library at all?

I think that take is dumb.

Is Postgres going away? Is Redis going away? Is React going away? No. And I'd bet they matter more in five years, not less.

## The best version of the other side

I want to be fair here, because the other side has real points.

Anish Acharya at a16z wrote about [disposable software](https://a16z.com/disposable-software/): little apps built for you and a couple of friends, because the cost of building them collapsed. His example is a mini Instagram for his kids' cat photos. As he puts it, "You wouldn’t write a thousand lines of code just to share photos with three people." Now you would, because an agent writes it in an hour.

Armin Ronacher made the dependency version of this argument in [Build It Yourself](https://lucumr.pocoo.org/2025/1/24/build-it-yourself/): "It’s 2025 and it’s faster for me to have ChatGPT or Cursor whip up a dependency free implementation of these common functions, than it is for me to start figuring out a dependency." He's right. A tiny npm package to pad a string was never worth the supply chain risk.

Then there's the data. Amplifying [pointed Claude Code at real repos 2,430 times](https://amplifying.ai/research/claude-code-picks) and watched what it chose. Their big finding: "Claude Code builds, not buys." Ask it to add feature flags and it rolls its own config system. Ask for auth in Python and it writes JWT and bcrypt from scratch. For Python caching, Redis went from 93% of picks with Sonnet 4.5 to 29% with Opus 4.6, and half the newer model's picks were custom code instead.

And the one that hits closest to home for me: Shopify [moved the Shop app off React Native](https://shopify.engineering/shop-app-migration) to Swift and Kotlin. Their words: "advances in coding agents changed the tradeoffs behind maintaining a shared mobile codebase." Ivan Kuznetsov went further in [Flutter and React Native Won't Survive the AI Revolution](https://capk.me/p/flutter-and-rn-wont-survive): "The layer of abstraction is the specification."

That's the strongest case. Code is cheap now, so why carry someone else's abstraction?

## Read the fine print

Here's what I notice when I actually read these.

Shopify didn't go framework-free. They tested whether agents could build "directly in SwiftUI and Jetpack Compose." Those are frameworks. Then, for the bigger Shopify app, they built a tool called [Helix](https://shopify.engineering/helix) so agents follow "a highly opinionated architecture we designed for the new native apps." They swapped one abstraction for another and wrote down even more rules for the agents. That's the opposite of frameworks going away.

Ronacher draws the same line himself. In the same post: "There are the important libraries that solve hard problems." He names HTTP and QUIC and says, "I won’t be able to get rid of tokio and I have no desire to."

Acharya's point is about software that's fine to throw away. Cat photos for three people. Nobody's arguing your payroll system should be disposable.

And that Claude Code study? When it does pick a tool, it picks decisively: Stripe for payments, shadcn/ui for components, PostgreSQL as the default database. The things agents skip are mostly small stuff. The things they skip that they shouldn't, like hand-rolled auth, are exactly my point.

## Agents need shared vocabulary

When I write less code by hand and agents write more, the shared parts get more valuable.

If ten agents are working in my repo, I want all of them speaking React, Postgres and Redis. Not ten slightly different homemade state systems that each agent invented on a Tuesday. A framework is a contract. It tells the agent where things go and what "correct" looks like.

Martin Fowler said it well in his note on [vibe coding](https://martinfowler.com/bliki/VibeCoding.html): "well-structured software makes life easier for LLMs too."

I used to think the main win was training data. Models have seen a mountain of React, so they're great at React. Simon Willison [used to recommend](https://simonwillison.net/2025/Mar/11/using-llms-for-code/) picking popular libraries for that reason: "innovate on your project’s unique selling points, stick with tried and tested solutions for everything else." He's since said [he's not sure that holds up](https://simonwillison.net/2026/Mar/9/not-so-boring/), because agents can read docs and learn new tools fine.

Fair. But that's still a point for shared tools. The agent learns the framework once and reuses it everywhere. The bespoke version has to be relearned every time.

## You don't regenerate correctness

This is the big one for me.

Postgres has decades of work in it: transactions, durability, concurrency, crash recovery. Redis has years of people getting burned by edge cases so you don't have to. React has years of people fixing weird rendering bugs on real devices.

An agent can write you a cache in thirty seconds. It can't write you thirty years of production incidents.

When the cache your agent wrote loses data under load, who debugs it? There's no Stack Overflow thread for code that only exists in your repo. There's no changelog. There's no security team patching it. It's just you at 2am reading code nobody else has ever seen.

Hand-rolled auth is the same story. JWT plus bcrypt from scratch works great right up until it doesn't.

## The boring reasons still matter

Ecosystems matter. React has a library for basically everything, and those libraries work together.

Hiring matters. I can hire someone who knows Postgres tomorrow. I can't hire someone who knows the database my agent invented last month.

Debuggability matters. When something breaks I want docs, tooling and a thousand people who hit the same bug before me.

None of that goes away because code got cheaper to write.

## What actually goes away

Here's where the other side is right. Some stuff is dying, and good riddance.

Boilerplate. Glue code. The CRUD screen you've written forty times. Tiny dependencies that should've been five lines. Wrappers around wrappers. Maybe even some cross-platform layers, if a team decides agents can keep two native apps in sync.

That's the stuff agents are great at. Let them have it.

But the foundations underneath, the database, the cache, the UI framework, the stuff that has to be correct, isn't going anywhere. If anything, I want more of my code sitting on top of it.

Frameworks aren't going away. Glue code is.
