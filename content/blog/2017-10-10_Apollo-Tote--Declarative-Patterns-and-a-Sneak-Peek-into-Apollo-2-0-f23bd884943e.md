---
title: Apollo Tote, Declarative Patterns and a Sneak Peek into Apollo 2.0
description: A guest post on the Apollo GraphQL Blog
date: 2017-10-10T18:32:18.998Z
categories: []
---

![Photo by [Lee Campbell](https://unsplash.com/photos/qNPESem_t4I?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)](https://cdn-images-1.medium.com/max/800/1*-iRwtXSSIuhyj80jS6Js_w.jpeg)
Photo by [Lee Campbell](https://unsplash.com/photos/qNPESem_t4I?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)

_This is a guest post from_ [_Peter Piekarczyk_](https://medium.com/u/cff8a83d5fc3)_, technical co-founder and Apollo / React Native guru at_ [_Orchard.ai_](https://www.orchard.ai/)_._

[Apollo Tote](https://github.com/peterpme/apollo-tote) is a declarative React component. Take what you’ve been doing inside your “smart” containers and apply it with JSX! It’s meant to be a simple helper library for your Apollo queries until declarative components are released in Apollo 2.

> I created this because I don’t believe separate components and containers need to be applied everywhere. There are times where I’d prefer to see everything in one, succinct file.

I came up with the idea for Apollo Tote while working on [Orchard Ai](https://www.orchard.ai). We’re utilizing [Expo](https://www.expo.io) and [Apollo](https://apollodata.com) to help you stay on top of your relationships & network the same way you do about diet, health and fitness.

At the very minimum, give it a query and a few render props:

```javascript
<ApolloTote
 query={`user { imageUrl }`}
 renderLoading={() => <Avatar.Loading />}
 render={result => <Avatar imageUrl={result.user.imageUrl />}
/>
```

Note: Apollo Tote is not meant to be used everywhere. We only support queries for now. That being said, there are places where Apollo Tote shines!

### Use Cases

#### Logged In / Logged Out (Authentication / Authorization)

Authentication & Authorization have always been a drag, for whatever reason. You’ll save a user token in localStorage, but you start to realize there’s a few cases you need to handle:

- A token exists but the user no longer does (this sounds so dark IRL)
- A token exists but has expired
- There is no token (this one’s easy!)

Apollo Tote Authorization & Authentication Example

`renderError, renderLoading, render` are all Apollo-specific and map directly to { error, loading, data }.

`test, handleFail, handlePass` are additional helper methods you can use to test for something specific.

In this case I’m testing for `user.id`, but you can use it for anything where you might use `branch` in Recompose: anything that needs to pass or fail.

In this case, I’m dispatching `LOG_IN / LOG_OUT` with Redux, but feel free to use an event emitter or call a class method, etc.

#### Handling Loading / Error States

I like to load a different component when I’m handling error state. My favorite way of doing that is by exporting a `Loading` component. This way I don’t have to fk around with any of the styling to get the loading state I’d like. It just works!

Apollo Tote makes that super easy for ya by giving you the `renderLoading` prop:

Apollo Tote Loading State Example

### Final Thoughts

Apollo Tote & render props are a great option when it comes to working with a complex application structure. While Apollo Tote is around today, a version of it will appear in Apollo 2. I’ll keep the API as similar as I can so when its ready, all you’ll have to do is replace the import!

This is an awesome opportunity for the community to help make Apollo 2’s declarative components an awesome experience.

Shout-out to my friends [Kye Hohenberger](https://medium.com/u/93de0780c5e6) and [Kyle Shevlin](https://medium.com/u/e55117c5994d) for the feedback. It’s something I always appreciate!

