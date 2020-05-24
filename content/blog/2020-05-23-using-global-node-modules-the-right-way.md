---
title: Using Global Node Modules The Right Way
date: 2020-05-23T17:43:23.330Z
description: Stop re-installing the same global node modules for every version of Node
categories: [node]
---

```sh
mkdir ~/npmbin/
```

```sh
npm init
```

Install a global cli (don't use `--global` or `-g`!)
```sh
npm install `expo-cli`
```

Add it to your path:
```
export PATH=$PATH~/npmbin
```


