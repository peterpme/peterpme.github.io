---
title: Getting Cairo, Starkware's Language Up and Running on an M1 Mac
date: 2022-12-14T22:11:04.724Z
categories: [starkware, cairo]
---

Cairo is a powerful language. Their developer docs could use some work 😅
I was going to PR this until I realized their docs aren't public, so here we are!

There are two repos:
- [Cairo Lang](https://github.com/starkware-libs/cairo-lang)
- [Cairo](https://github.com/starkware-libs/cairo)

**Cairo Lang**

The original python implementation. I've heard it doesn't scale well and it seems like it's deprecated in favor of Cairo.

This hasn't happened yet so you might still have to get it working.

**Cairo**

The new Rust implementation. Seems way easier to use, built in rust. The new path forward!

Despite having both of these options, you might still need to get Python up and running.

Here's how I did it:

The first few steps are easy. You're installing a specific version of python via brew and following [their docs](https://www.cairo-lang.org/docs/quickstart.html)

```sh
brew install python@3.9
python3.9 -m venv ~/cairo_venv
source ~/cairo_venv/bin/activate
```

This is where it gets interesting. I had to install this `arch -arm64` version of gmp first.

```sh
arch -arm64 brew install gmp
brew --prefix gmp
```

Once you've confirmed it works and you're running this within your python3 environment, you need to set these flags.

What do these flags do? Just make sure that pip is installed with the correct version of `gmp`

```sh
CFLAGS=-I`brew --prefix gmp`/include LDFLAGS=-L`brew --prefix gmp`/lib pip install ecdsa fastecdsa sympy
pip3 install cairo-lang
```

Once you've done that, this should run!

```sh
cairo-compile test.cairo --output test_compiled.json
```



