---
title: "Command Line Tip: Lowercase all file names in a given directory"
description: "If I didn't write about it, I'd forget it."
date: 2017-12-28T19:19:12.213Z
---

![Photo by [Franz Harvin Aceituna](https://unsplash.com/photos/vkfrFrAIO4o?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)](https://cdn-images-1.medium.com/max/800/1*sS6KcsjhHDEI1T0ka164Wg.jpeg)

Here’s a one-liner you can use to change all the filenames that include uppercase letters to lowercase. If I didn’t write about it, I’d forget how it works, so here we go!

```sh
for f in *;
  mv $f $(echo $f | tr '[:upper:]' '[:lower:']);
done;
```

Break down:

`for file in *`:

For every file (variable). You could also do `in *.pdf` and that would only select PDF’s for example

`do echo $f`:

do is part of the for loop syntax, `echo` the variable `f`

`mv $f $(echo $f | tr '[:upper:]' '[:lower:'])`:

1. Run `translate characters (tr)` command to translate upper case characters to lower case characters
2. Then move the original file name to the one outputted by the `tr` command
3. You're done! Celebrate

