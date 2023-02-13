---
title: Environment Variables in Expo using Release Channels
description: Makes it easy to release to multiple environments
date: 2018-01-02T17:31:06.699Z
categories: []
keywords: []
---

![Photo by [Sergii Bozhko](https://unsplash.com/photos/_56sISeZzLc?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)](https://cdn-images-1.medium.com/max/800/1*lBI5jG-D0rBhO3OnSgm6Ag.jpeg)
Photo by [Sergii Bozhko](https://unsplash.com/photos/_56sISeZzLc?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)

Expo has recently released [Release Channels](https://docs.expo.io/versions/latest/guides/release-channels.html) that allow you to deploy, rollback and test your app with different users by just adding the `--release-channel` flag on the publish command.

One of my favorite things about Release Channels is the ability to define pseudo environment variables so I can easily switch between dev, staging & prod.

Here’s how I do it:

An example of handling environment variables in Expo using Release Channels

The reason why I use indexOf is because I’ll release new versions of my app based on the package.json version. That way I keep things sync’d up across the entire Orchard ecosystem:

```sh
exp publish --release-channel staging-1.20.1
exp publish --release-channel staging-1.21.0

exp publish --release-channel prod-2.0.0
```

#### Notes:

- In the current release of **Expo v24**, the releaseChannel key DOES NOT show up in dev mode.
- In future releases, the releaseChannel key may show up as **undefined**. DO NOT quote me on this, its just speculation.

