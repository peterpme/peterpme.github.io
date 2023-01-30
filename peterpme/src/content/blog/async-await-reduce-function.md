---
title: Using async / await with reduce in Javascript
date: 2020-06-04T00:54:35.875Z
---

I got stumped trying to figure out how to use async / await. Here's how you do it: 

```js
async function buildObject(items) {
  
  // promise here is technically the accumulator so we await to get it
  return items.reduce(async (promise, item) => {
    const obj = await promise;
    obj[item.id] = await getItem();
    
    // return the object as usual
    return obj
    
    // resolve an empty object (the thing we want)
  }, Promise.resolve({}));
}
```

Pretty sick huh
