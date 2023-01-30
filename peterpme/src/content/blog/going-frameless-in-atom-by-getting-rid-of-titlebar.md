---
title: Save 20px by Going Frameless and Getting Rid of Atom’s Title Bar
description: That's an extra line of code in your editor!
date: 2016-10-29T21:15:42.002Z
categories: [atom]
---

Being a fan of keyboard shortcuts, I have never been a fan of macOS’ Title Bar.

- Close
- Minimize
- Full Screen

You know the bar I’m talking about. Most of the time, it’s not worth the real estate.

I scoured Github Issues and PR’s until I found exactly what I was looking for: [A recipe](https://github.com/atom/atom/issues/4599#issuecomment-246213477), thanks to the man by the name of [deeperx on Github](https://github.com/deeperx).

```sh
# quit Atom

npm -g install asar
asar e /Applications/Atom.app/Contents/Resources/app.asar /tmp/atomasar

# 1. Edit src/main-window/atom-window.js & add:
#   frame: false

# 2. After the line
#   title: 'Atom'

# 3. Save

asar p /tmp/atomasar /Applications/Atom.app/Contents/Resources/app.asar
rm -rf /tmp/atomasar
```

![See! No Title Bar!](https://cdn-images-1.medium.com/max/800/1*K-bqRArMonf9nsm1jubahw.png)
No Title Bar!

#### Keep in mind!

When you do this, moving your window around with a mouse will be virtually impossible, make sure you use some window management software!

[View the issue on Github](https://github.com/atom/atom/issues/4599#issuecomment-246213477)

