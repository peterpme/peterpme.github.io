---
title: "Git Checkout Tricks You've Never Heard Of"
date: 2020-05-20T01:00:53.459Z
---

Want to know one of my favorite git secrets? It has to do with `git checkout`.

Sometimes you've made and committed files that shouldn't be there. Stuff like `prettier` or `console.logs` you forgot to remove. You can mess around with `git cherry-pick` or `git revert` but that can be a hassle sometimes.

If you have a file called `screens/MyScreen.js` that you want to completely reset based off `master`, run this:

```sh
git checkout origin/master -- my/file/whatever.js
```

This works with other branches or folders, just replace `master` with `any-branch-name` and the file with the folder name:

```sh
git checkout origin/any-branch-name -- folderName
```

Running this will completely reset the file and get you back on track to merge your PR in!

Have your own tricks? Let me know.
