---
title: Shaving 2 Minutes Off Our Graphcool Deployment Times
description: In as little as 1 minute
date: 2018-01-06T19:43:23.330Z
categories: []
---

![Photo by [Erik Eastman](https://unsplash.com/photos/yiptq3TFiX8?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)](https://cdn-images-1.medium.com/max/800/1*emGM4P2MpMFkQ2pIT1Cifg.jpeg)
Photo by [Erik Eastman](https://unsplash.com/photos/yiptq3TFiX8?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)

[Graphcool](https://graph.cool) is an awesome GraphQL-powered backend we use at [Orchard](https://www.orchard.ai). One of the features they offer is custom functions (resolvers) a la AWS Lambda.

The thing is, deploying to any environment includes both prod AND dev dependencies inside your node_modules folder. That means eslint and anything else you have in that directory.

I’m sure this will change soon enough, but for now there’s a few simple steps we can follow to minimize our bundle size & time spent deploying:

1. Remove any files & folders that aren’t related to Graphcool. That goes for any scripts, utilities, functions, etc that don’t need to live here.

**/src only includes the functions we require. Nothing else.**

```tree
├── README.md
├── graphcool.yml
├── node_modules
├── package.json
├── src
├── types.graphql
└── yarn.lock
```

2. Create npm commands in your package.json that will delete node_modules and only install packages required for production. Now you’ll know for sure that none of your eslint stuff will be bundled and deployed.

```json
"deploy:dev": "rm -rf node_modules && yarn --prod && graphcool deploy -t dev && yarn"
```

3. Lastly, **YMMV** but yarn includes a `—-flat`flag you can use to only install one version of a package across ALL your dependencies. We didn’t run into any issues using this, but you might so give it a go on dev first:

```json
"deploy:dev": "rm -rf node_modules && yarn --prod --flat && graphcool deploy -t dev && yarn"
```

We were going to go as far as removing lodash and installing only the modules we use (lodash.chunk, lodash.get) but after running — flat, we discovered some of our node modules already require lodash and saved ourselves the hassle by just forcing that version. Our yarn.lock file is like 100x smaller!

#### We went from 120s deployments down to 19.1s!

So it was worth writing about :)

