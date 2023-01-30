---
title: Learning Higher-Order Components in React
description: We're building a general purpose loading screen
date: 2018-04-24T12:01:01.351Z
categories: []
---

![A higher-order component in the wild by [Gamze Bozkaya](https://unsplash.com/photos/kxGHHEjUP7Q?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/search/photos/higher-order?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)](https://cdn-images-1.medium.com/max/1200/1*WqA5KCPtu44P14_6NgX3Bw.jpeg)
A higher-order component in the wild by [Gamze Bozkaya](https://unsplash.com/photos/kxGHHEjUP7Q?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/search/photos/higher-order?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)

Let me share a secret: no matter how long you’ve been doing something, you’re bound to have to relearn some part of it. I haven’t built my own higher-order component in a long time and made a lot of mistakes. Real mistakes.

### Why?

The other day I was adding a simple loading indicator to screens in my new app. You’ve probably used this pattern before:

An InfoScreen that renders Hi when loading is false in React Native

This is great. It’s simple and convenient for one screen. If you’re not used to React Native, `ActivityIndicator` is one of the beautiful parts of app development — a component that _exists_.

When you find yourself repeating this same pattern often, its nice to see what we can do to rid ourselves from the tedious task of Copy & Paste.

### What do I know?

I know that I’ll have a `loading` prop FOR SURE.

What am I apprehensive about? The strategy I will use to genuinely make my life easier (instead of harder — sometimes we need a friendly reminder).

![Highly Organized Fruit by [Alex Block](https://unsplash.com/photos/vWI1kTcMcDI?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/search/photos/order?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)](https://cdn-images-1.medium.com/max/2560/1*KHFk4TZZQlAscHgktarR4w.jpeg)
Highly Organized Fruit by [Alex Block](https://unsplash.com/photos/vWI1kTcMcDI?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/search/photos/order?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)

### First Pass

First pass at a loading indicator higher-order component

Besides the function wrapping `React.PureComponent` everything should look familiar. If you want to skip ahead and use this as-is, just paste this into our `InfoScreen` file and wrap the export:

```javascript
export default withLoadingScreen(InfoScreen);
```

This pattern may look familiar if you’ve used Apollo or Redux before:

```javascript
export default connect(
  mapStateToProps,
  mapActionCreators
)(InfoScreen);
```

### Compose

If you’re wondering how to use both `connect` and `withLoadingScreen` you can wrap the components individually or use a `compose` function. Writing a compose function by hand is cool, but importing the one from one of the libraries you’re already using is cooler. Both `redux` and `react-apollo` come bundled with their own:

various compose imports from redux / react-apollo

### Does it work?

Depending on what your setup looks like, it might work perfectly or it might not work at all! 😃 🙃

I’m using `react-navigation` which supports a static method called [navigationOptions](https://reactnavigation.org/docs/stack-navigator.html#navigationoptions-used-by-stacknavigator) to override header title and styles.

The loading screen works as intended, but the header styles are gone! What happened? [Static methods aren’t copied over!](https://reactjs.org/docs/higher-order-components.html) It’s super easy to overlook but also super easy to fix.

There’s a library called [hoist-non-react-statics](https://github.com/mridgway/hoist-non-react-statics) that will automatically copy over static variables like `navigationOptions` , `defaultProps`and `propTypes`.

### Second Pass: Hoisting Static Variables

Second pass at LoadingScreen higher-order component

Instead of returning the class immediately, we return it only after calling `hoistNonReactStatics` . The header is rendering correctly again. Woo!

### Third Pass: Passing in Options

Now that the loading screen itself functions correctly, I want to pass in a different loading indicator size for different screens.

Sometimes the default loading indicator is too big or the wrong color so I’d like to be able to adjust when I need to.

`connect` and `graphql` both give you options:

- `connect(mapStateToProps, mapActionCreators)`
- `graphql(MyQuery, { options })`

We can do the same by adding another function call:

withNavigationOptions Higher Order Component with additional options

In this case I wanted to control the size of the `ActivityIndicator`

```javascript
withLoadingScreen("large")(InfoScreen);

// or using compose:

compose(
  withLoadingScreen("large"),
  compose(
    mapStateToProps,
    mapActionCreators
  )
)(InfoScreen);
```

### Bonus Round: Naming Your Components

You’re bound to run into issues. Sometimes the component name doesn’t show up or doesn’t match the component in question. We can fix this easily by writing a simple function called `getDisplayName` :

```javascript
function getDisplayName(WrappedComponent) {
  return (
    WrappedComponent.displayName || WrappedComponent.name || "LoadingScreen"
  );
}
```

A higher-order component with a display name

### Conclusion

Higher-order components have a few weird things about them that you can fix easily. Code responsibly.

