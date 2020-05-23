---
title: Git Checkout Tricks
date: 2020-05-20T01:00:53.459Z
---

Want to know one of my favorite git secrets? It has to do with `git checkout`

I've been in situations where I'm looking at a diff and realizing that due to prettier or eslint or whatever, there's been changes done to a file that didn't have to be there. We can run prettier on the whole project in a separate PR, the reviewer shouldn't have to worry about indents and shit.

There are other cases where this might apply - splitting a large PR into smaller ones. Sometimes `git cherry-pick` works, sometimes it doesn't.

Draftbit's a monorepo, so for special reasons, I needed to grab an entire folder and p

```sh
git checkout origin/master -- my/file/whatever.js
```

```sh
git checkout origin/any-branch-name -- folderName
```
