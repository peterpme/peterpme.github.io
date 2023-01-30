---
title: Implicit imports in Webpack using ProvidePlugin
description: "Get rid of commonly used import statements"
date: 2016-04-19T18:01:28.487Z
categories: tech
---

Do you find yourself writing this in every single one of your files?

```javascript
import React from ‘react'
```

Remember how you used the `ProvidePlugin` to replace `Promise` globally in your app?

We can use that same approach for stuff we’re using everywhere else too.

```javascript
// webpack.config.js

new webpack.ProvidePlugin({
  React : ‘react’,
  Promise : ‘bluebird’,
  cx : 'classnames',
  get : 'lodash.get'
})
```

Now, I understand I use a few examples here, but I wouldn’t get too crazy. Focus on the packages you’re confident you’re going to use EVERYWHERE

