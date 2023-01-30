---
title: Working Through cannot find module unicode/category/So in Keystone
description: "Fixing Keystone's unicode problem"
date: 2016-04-13T19:56:30.511Z
categories: tech
---

Every once in awhile, you might encounter an error like this in KeystoneJS:

```sh
module.js:341
 throw err;
 ^

Error: Cannot find module ‘unicode/category/So’
 at Function.Module._resolveFilename (module.js:339:15)
 at Function.Module._load (module.js:290:25)
 at Module.require (module.js:367:17)
 at require (internal/module.js:16:19)
 at symbols (E:projectskeystoneappnode_modulesslugslug.js:6:16)
 at E:projectskeystoneappnode_modulesslugslug.js:199:5
 at Object.<anonymous> (E:projectskeystoneappnode_modulesslugslug.js:212
:2)
 at Module._compile (module.js:413:34)
 at Object.Module._extensions..js (module.js:422:10)
 at Module.load (module.js:357:32)
```

What the heck is unicode? Why Does it keep freakin’ out on me?

> Unicode is a character encoding standard for handling text expressed in most of the world’s writing systems

You’ve probably heard of `UTF-8`, well UTF stands for: Unicode Transformation Format and the 8 means it uses 8-bit blocks to represent a character, but you can learn all about that on your own!

Here’s how to fix it:

Remove the npm unicode package, if it exists:

```sh
npm remove unicode
```

Install unicode-data on your Ubuntu (or *nix) box:

```sh
sudo apt-get install unicode-data
```

Reinstall the npm unicode package:

```sh
npm install unicode
```

Sources:

- [http://www.fileformat.info/info/unicode/utf8.htm](http://www.fileformat.info/info/unicode/utf8.htm)
- [https://en.wikipedia.org/wiki/Unicode](https://en.wikipedia.org/wiki/Unicode)

