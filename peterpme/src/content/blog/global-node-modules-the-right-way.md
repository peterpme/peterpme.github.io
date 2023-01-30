---
title: Using Global Node Modules The Right Way
date: 2020-05-23T17:43:23.330Z
description: Stop re-installing the same global node modules for every version of Node
categories: [node]
---

When using tools like `nvm`, `n` or even `homebrew` you can end up installing multiple verisons of Node. This could mean that when you run `npm install -g` over time you'll have the same executible installed in a bunch of different places. See for yourself:

```
type -a expo-cli
```

Do multiple versions come up?

## A Global npmbin

Create a global `npmbin`: one place to store all of your global dependencies without having to call them with the global flag! This folder will have its own `package.json` and specific node version. No more node_module bloat, no more linking, _it just works_.

## Creating your bin


Create a new directory under home and cd into it:

```sh
mkdir ~/npmbin/ && cd $_
```

Init with package.json. None of the fields really matter, its all local.

```sh
yarn init (or npm init)
```

Add `~/npmbin` to your path. Open your `~/.bashrc` or `~/.zshrc` and on a new line:

```
export PATH="$HOME/npmbin:$PATH"
```

What this does is makes `~/npmbin` available to use everywhere. Save & restart your terminal window. 

Then navigate back to your `~/npmbin` directory and install a module you'd typically use globally (`expo-cli` or `gatsby-cli` are two I use a lot):

Don't use `--global` or `-g`! You don't need to anymore :smile:

```sh
npm install `expo-cli`
```

## Conveniently Installing Modules

You might think its annoying to have to cd into `~/npmbin` every time you want to install something globally. Although it doesn't happen alot, I still did. I created a simple alias function to make it easier:

`yg expo-cli`

Think `yarn global` but call it whatever you'd like!

```sh
yg() {
  cd $HOME/dotfiles/npmbin
  yarn add $@
  cd -
}
```

- Cd into `npmbin`
- add the file that was passed in as an argument
- cd back to wherever you were

Place this inside your `~/.zshrc` or `~/.bashrc` file and restart your terminal. Give it a go.
