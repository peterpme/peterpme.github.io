---
title: Your first ReasonML PR into an existing React Native Codebase
description: Type-safe, fast with a similar syntax to javascript makes it an obvious choice.
date: 2018-03-03T19:19:08.514Z
categories: []
---

![A delightful plate of Reason. Take a bite! by [Amy Treasure](https://unsplash.com/photos/WoVGndRTx2o?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/search/photos/reason?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)](https://cdn-images-1.medium.com/max/1200/1*SaPK2OLdX_BeFp7yxRvbcg.jpeg)

ReasonML is becoming a popular way of building React apps. It’s based on the OCaml programming language with syntax very similar to JavaScript but with a compiler that warns you early on, instead of when your app is live!

If you’ve been sold on ReasonML and you’re ready to incorporate your first component into a personal or better yet — company project!, this article is for you!

### Read This First

My goal is for you to get your first PR out the door. I’m skipping over a lot of the “why” and jumping right into “this is how”.

Learning something new is never easy. Making time for learning is already a struggle given how much bosses are piling onto our plates these days. I want to make this as stress-free and simple for you as possible.

If you find that it’s not, just [let me know.](https://twitter.com/peterpme) Until then sit back, relax, stretch your copy-and-paste fingers and follow along. Welcome to Reason.

### Installing Reason

A huge convenience of Reason is being able to install everything through npm. That makes it super easy to get started. [Read more about it here.](https://github.com/reasonml-community/bs-react-native)

```sh
yarn add --dev bs-platform && yarn add reason-react bs-react-native
```

#### Create a bsconfig.json

bsconfig.json is a file that supports settings for [bucklescript](https://bucklescript.github.io/). After looking at a bunch of these, I’ve concluded that they’re usually exactly the same.

**Altos is the name of my app. You should replace that 😃**

#### Add Scripts

```json
"scripts": {
 "build": "bsb -make-world -clean-world",
 "watch": "bsb -make-world -clean-world -w"
}
```

#### Project Structure

Create a `re` folder next to package.json This is where all of your components will live. In our `bsconfig.json` file we have `sources` that already include `re` . [Here are some other great guidelines](https://reasonml.github.io/docs/en/project-structure.html#publishing).

All your components will need to be capitalized:

- Typography.re
- Label.re
- Add the following to your `.gitignore:`

```sh
.merlin
.bsb.lock
lib
```

#### .bs.js files

If you want to sneak Reason into your codebase without forcing your teammates to install `bs-platform` you’re welcome to add the generated `*.bs.js` files. That being said, you might face merge conflicts down the road.

If your teammates are all cool with Reason, place `*.bs.js` inside your `.gitignore` and have them install `bs-platform.`

Every team is different so I leave this decision up to you. Chances are you can get away with including them and [figure it out later.](https://reasonml.chat/t/should-i-include-or-exclude-bs-js-files-in-git/60)

#### Press Play

1. Open up a terminal window and run `yarn watch or npm run watch`
2. Start your React Native Project `react-native run-ios` or `expo start`

If nothing broke, you have succeeded in getting your project ready for Reason! Pat yourself on the back — you have taken an enormous step forward to your first Reason pull request!

![Delicious bite-size chunks of Reason by [Rose Elena](https://unsplash.com/photos/llWdsvyRxYA?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/search/photos/treats?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)](https://cdn-images-1.medium.com/max/2560/1*0Q7LTDXRR0b89ByL9nbrpg.jpeg)
Delicious bite-size chunks of Reason by [Rose Elena](https://unsplash.com/photos/llWdsvyRxYA?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/search/photos/treats?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)

### Your First Component

Creating your first component can be really easy or really hard. If you’re going to try and convert something with a lot of external modules, you’re going to have a bad time.

The first component I introduced into our project was a simple Label:

Label component in ReactJS

The label consumes a prop `label` and sets the background color to gray. The only components I’m using are `View, Text, StyleSheet` because the bindings are supported by [bs-react-native](https://github.com/reasonml-community/bs-react-native).

Bindings let ReasonML know the type of your code from Javascript so it can save you from making silly mistakes later.

#### Converting to Reason

At first glance, a lot of things are the same, but a lot are different. **ReasonML requires semicolons!** The compiler will delightfully let you know.

The Label component converted to ReactReason.

#### Imports

In ReactJS and Javascript, you’d import something via `import React from 'react'` or `const React = require('react').`

Reason will import the libraries you have installed automatically. We added them in `bsconfig.json.`

When you see `open BsReactNative` you’re doing something similar to `import { Component } from 'react'.` You can `import React from 'react'` and then call React.Component, or import the Component directly and save yourself some text.

So, instead of writing `BsReactNative.StyleSheet, BsReactNative.View` I can `open BsReactNative` and write `StyleSheet, View` instead.

#### Local Opens

```re
Style.(
```

A dot with nothing after it in this case is called a “local open”. Its the same as calling `import Style` but only for this function. This helps us avoid conflicts across the whole file.

See how within the function we’re calling `borderRadius` ? We could also do something like this instead:

```re
style=(
 Style.style([
 Style.borderRadius(4.)
]);
```

_(thanks to_ [_Sean Grove_](https://medium.com/u/ddb95b022776) _for pointing this out!)_

#### Styling / StyleSheets

Styling is tricky at first but gets easier over time. Let me save you a lot of time and effort by linking you to [all the style types supported by bs-react-native](https://github.com/reasonml-community/bs-react-native/blob/master/src/style.rei). I’d highly recommend keep this open until you get the hang of it!

Why is styling tricky? Because you’re not used to typing things a certain way. Here’s a great example:

```re
borderRadius(4.)
```

vs

```re
paddingHorizontal(Pt(10.))
```

In ReactJS, `borderRadius` and `paddingHorizontal` are the same type (number). but in ReactReason, they’re different:

- `borderRadius` is a [float](https://github.com/reasonml-community/bs-react-native/blob/master/src/style.rei#L278).
- `paddingHorizontal` is a [pt_pct](https://github.com/reasonml-community/bs-react-native/blob/master/src/style.rei#L156). `pt_pct` isn’t a Reason thing. It’s a type within the bs-react-native library that means:

> This can either be a float wrapped by point (pt) or a float wrapped by a percentage (pct)

#### Components

A stateless function component in ReactJs will be represented by a function:

```javascript
const Label = ({ label }) => <Text>{label}</Text>;
```

In Reason React:

```re
*/ Label.re */

[@react.component]
let make = (~label) => <Text> {React.string(label)} </Text>
```

`[@react.component]`:

You put this above every component. Think of this like a decorator in Javascript. It knows to convert the sugar to React calls.

The arguments:

- Optional components look like this: `~label=?` with an `=?` at th
  e end
- Default arguments should look familiar: `label="Network"`

#### stringToElement

If you try to display your label the same way you would in ReactJS, you’ll be greeted with a compiler error. That’s because you have to convert the string to an React element: `ReasonReact.stringToElement(label).` Why do we do this? Because [Reason’s type system restricts you from passing arbitrary data](https://reasonml.github.io/reason-react/docs/en/render.html#docsNav).

You’ll also notice a space between `<Text> </Text>`. That’s intentional!

There’s a good chance you’re going to display a number in your first component. That would look like this:

```re
<Text> {ReasonReact.stringToElement(string_of_int(10)} </Text>
```

There’s a [couple of different](https://reasonml.github.io/reason-react/docs/en/render.html#docsNav) special element types you might need, but I would strongly suggest you focus on a simple component first.

#### Exporting your component to JS land

In ReactJS, you’d write `export default` or `export const` and consume your component the way you would with anything else.

In ReasonReact, there’s an extra step you have to take via `wrapReasonForJs` .

```re
let default =
  ReasonReact.wrapReasonForJs(~component, jsProps =>
    make(~label=jsProps##label, [||])
  );
```

Basically the pattern is to take your props (in this case we only have label) and pass them in as: `~label=jsProps##label` . Children will look like: `[||]` .

#### Use it!

You’ve done such a great job putting together your first component, it’s time for you to use it. Just import it with the `bs` extension:

```re
import Label from "./re/Label.bs.js"

<Label label="REACT NATIVE" />
```

### Push it up & let me know!

I challenge you to create one small, tiny Reason component and introduce it into your company’s React Native app. If you do, please [let me know!!](https://twitter.com/peterpme)

Otherwise, until you’re ready [follow me on Twitter](https://twitter.com/peterpme). You’ll see a lot of Reason-related stuff.

[I created a base repo of this & expo as a reference.](https://github.com/peterpme/reason-react-native-example)

_Thanks to_ [_thangngoc89_](https://khoanguyen.me/) _and_ [_sgrove_](http://www.riseos.com/) _for peer-reviewing this._

