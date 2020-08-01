---
title: "Quickly delete old git branches with fzf and zsh"
date: 2020-08-01T05:00:00.000Z
---

Do you fall victim to having a million branches when typing in `git branch`? It's a pain. I wrote this quick helper that lets me select the branch I want and deletes the rest:

![interactive branch delete](./fzf-delete-branch.gif)

You need `fzf` for this to work: `brew install fzf`. Fzf is one of the sickest tools of our generation so do your own research and start incorporating it into your every day flow!


Place this in your `/.zshrc` file and re-open your terminal. Viola.

```zsh
# fbd - delete git branch (including remote branches)
fbd() {
  local branches branch
  branches=$(git for-each-ref --count=30 --sort=-committerdate refs/heads/ --format="%(refname:short)") &&
  branch=$(echo "$branches" | fzf --multi ) &&
  git branch -D $(echo "$branch" | sed "s/.* //" | sed "s#remotes/[^/]*/##")
}
```
