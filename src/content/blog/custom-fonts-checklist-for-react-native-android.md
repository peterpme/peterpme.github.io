---
title: React Native Android & Custom Fonts Checklist
description: A checklist to make fonts easier to manage
date: 2016-06-10T23:13:58.447Z
categories: tech
---

Here are a few things to remember:

- file type needs to be `ttf` NOT OTF!
- Create `assets/fonts` if it doesn’t exist (mkdir -p assets/fonts)
- place the font files within `./android/app/src/main/assets/fonts/FONT_NAME.ttf`
- Recompile. `react-native run-android`
- `fontFamily: FONT_NAME (1:1)`
- Viola!

