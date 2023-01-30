---
title: Easily Deleting Deeply Nested Files with fd
date: 2020-06-05T16:06:23.990Z
---

`fd` is a modern replacement to the unix util called `find`. MacOS has all of these installed by default but they're really out of date. You can upgrade them via homebrew but then you're forced to prefix them with `g` or something else. Instead of having to worry about that, I'd rather just install `fd` via homebrew and never have to worry about compatibility.

Deleting files in a nested repo is so tiring, especially with git, so this is what I do:

```sh
fd MyFile.js -x rm -rf
```

It doesn't matter where `MyFile.js` lives, it can live `src/my/project/here/MyFile.js` and it'll find it and instantly delete it!

Install it using brew: `brew install fd`

Learn more about fd [here](https://github.com/sharkdp/fd)
