---
title: Troubleshooting Type Error Load Failed in React Native
date: 2023-02-13T06:00:00.000Z
categories: [React Native, Safari]
---

I recently struggled with fixing an cryptic error message: `TypeError: Load Failed` in my React Native app.

I'm running a service worker within a WebView. On iOS, that service worker runs in Safari. Safari has various issues and this is one of them.

`TypeError: Load Failed` might end up being a different issue for you, but for me it was a CORS related issue.

Here's how I figured that out:

- Opened Simulator running my app
- Opened Safari
- Top bar: Develop Menu
- Select Simulator
- Select localhost

![safari develop menu](../assets/type-error-load-failed-safari-develop-menu.png)

You might see some console.log's here. I also took the request I was running and copied it directly into Safari's console to see if I could recreate it.

![safari console](../assets/type-error-load-failed-safari-console.png)

Sure enough, I had a much better CORS-related error message.
