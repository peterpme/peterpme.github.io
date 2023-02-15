---
title: Contextual Based Code Search
description: Make search much more powerful for the every day developer
date: 2023-02-15T20:11:04.724Z
categories: [ai, code]
---

Contextual Based Code Search is a phrase (I think) I'm coining that makes search much more powerful for the every day developer.

Github Search is one of the most powerful tools out there when it comes to learning how different codebases work. Not only am I always
poking around a codebase, I'm also typing in different phrases and filenames to find the right path.

If you've never used it, Github search becomes much more powerful when you start using macros like:

```sh
language:typescript path: src/index.ts return res.send(202)
```

This one feature alone will help you narrow down to the specific language and specific path of the code you're looking for. That's great, but what about
the more nuanced examples? What happens when I want to:

Find all places that call `return res.send(202)`
- in a monorepo?
- in a Deno application?
- Using ESM (Node's new modules)

This is where the idea for Contextual Based Code Search comes from.

I would love to be able to write a query like "An example using turbo, expo, jest in a monorepo".

The results should return the same format Github search returns, with a variety of _real-world_ repos that are using all of the technologies.

There are plenty of boilerplates out there that try to do the same but are typically out of date or got something wrong. Having multiple examples is 
the key to solving an engineer's problem whose on the hunt. It's not often that the first StackOverflow question returns exactly what you need.
