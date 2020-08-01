---
title: React Router Authentication
description: An easy way to route based on a logged in user
date: 2016-07-28T22:03:12.087Z
categories: [react]
---

I was looking through the [issues of a popular boilerplate](https://github.com/davezuko/react-redux-starter-kit/issues/906) today and there was a question about how folks would handle authentication with this new style of creating routes ([PlainRoute](https://github.com/reactjs/react-router/blob/master/docs/API.md#plainroute)).

**Here’s what you need to know:**

- `requireAuth` is a [React Router](https://github.com/reactjs/react-router/blob/master/docs/API.md#onenternextstate-replace-callback) function. It takes 3 arguments: nextState, replace, callback
- **replace** is all we’re after, but you have the ability to do more if you choose to
- within `requireAuth`, invoke whatever technique you’re using to identify a user or a token
- If a token exists, carry on
- If a token does not exist, replace history with an unauthenticated route
- If you decide to use a callback, the transition will be blocked until `callback` is called (in the docs)

```javascript
function requireAuth (nextState, replace, callback) {
  const token = localStorage.getItem('@TOKEN')
  if (!token) replace('/')
  return callback()
}

// ...

export const createRoutes = (store) => ({
  path: '/',
  childRoutes: [

    // Authenticated
    {
      component: CoreLayout,
 **onEnter: requireAuth, // add this**
      indexRoute: Dashboard,
      childRoutes: [
        ProfileRoute(store),
        BillingRoute
      ]
    },

    // Not-authenticated
    {
      component: ModalLayout,
      childRoutes: [
        LoginRoute
      ]
    },

    // Other Not-authenticated routes
    HelpRoute,
    ContactRoute
  ]
})
```

If you have any issues, [hit me up](http://twitter.com/peterpme)!

