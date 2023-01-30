---
title: 5 Vim Plugins I Can’t Live Without for Javascript Development
description: >-
  I’m constantly looking for ways I can improve my workflows and development
  environment.
date: 2017-03-19T20:11:04.724Z
categories: []
---

I’m constantly looking for ways I can improve my workflows and development environment. Before I could even call myself a programmer, I was fascinated with making my terminal look cool, even if I didn’t exactly know how to use it yet! That’s stuck with me over the years and I’d love to share some of my recent favorites:

#### **1. Prettier — An Opinionated Javascript Formatter**

Prettier will automagically format your code so you don’t have to. Spend less time arguing styles with your peers so you can spend more time writing your app.

![A random Javascript file I saved. See how it automatically formatted it for me?](https://cdn-images-1.medium.com/max/800/1*vAggmzG1t1RpXK72ENQ6AA.gif)
A random Javascript file I saved. See how it automatically formatted it for me?

Installation for NeoVim and Vim is very straight forward:

- Install via npm `npm install -g prettier`
- Or Yarn (recommended) `yarn global add prettier`
- Add the following to your init.vim or vimrc file: 
  `autocmd FileType javascript set formatprg=prettier --stdin`
- If you want to format on save:
  `autocmd BufWritePre *.js :normal gggqG`
- If you want to restore cursor position on save (can be buggy): 
  `autocmd BufWritePre *.js exe "normal! gggqG<C-o><C-o>"`

**Why I personally like this:
**I’m no longer worried about making sure I’ve got the right formatting in place. I’m getting used to letting the computer control my source code so I can optimize time spent on app-related changes instead.

See more at [https://github.com/prettier/prettier](https://github.com/prettier/prettier)

#### **2. NrrwRgn — Narrow Region Plugin**

Select a part of your code and open it in a new buffer! When you’re ready to go back to the original file, just save it and your isolated changes appear instantly!

![Someone accidently made this FRIEND instead of USER. I loaded it up with NR, made the changes I wanted to make and brought them back to the original file!](https://cdn-images-1.medium.com/max/800/1*edlKjVNbcY8nEi6t7IYSdQ.gif)
Someone accidently made this FRIEND instead of USER. I loaded it up with NR, made the changes I wanted to make and brought them back to the original file!

Install using the Plugin Manager of your choice. I like Vim Plug.

Plug 'chrisbra/NrrwRgn'

**The commands I use most often:**

:NR - open selection in a new window
:NW - open current visuaul window in a new window
:NRP - mark a selection so you can open multiple parts of a file
:NRM - after using NRP, run this so you can open those parts!
[https://github.com/wesQ3/vim-windowswap](https://github.com/wesQ3/vim-windowswap)

**Why I personally like this:
**Sometimes I can get frustrated working with very large files. I like to focus on one part of that if I can. It’s easier on the eyes to see 5–15 lines instead of 150.

See more at [https://github.com/chrisbra/NrrwRgn](https://github.com/chrisbra/NrrwRgn)

#### 3. WindowSwap — Easily Swap Window Panes

By pressing `<leader>ww` you can swap windows around your screen without having to redo your layout.

![See how I swapped the two windows in this simple example?](https://cdn-images-1.medium.com/max/800/1*2TA_MurarkjxmbQ3E2bXEw.gif)
See how I swapped the two windows in this simple example?

Install using the Plugin Manager of your choice. I like Vim Plug.

Plug '[https://github.com/wesQ3/vim-windowswap](https://github.com/wesQ3/vim-windowswap)'

**Why I personally like this:
**When my ADD is in overdrive, I’ve got like 15 panes open. Sometimes I want to move stuff around without having to close it out and re-open it. This allows me to do just that.

See more at [https://github.com/wesQ3/vim-windowswap](https://github.com/wesQ3/vim-windowswap)

#### 4. ALE — Asynchronous Lint Engine

A linting plugin for Neovim and Vim 8. This will automatically hook into your linter’s configuration and show you errors in the gutter!

![I took a project I did before using Prettier. Saved it. Whoah! See all that red on the left hand side? That’s Ale doing its magic! You’ll also get the rule instructions at the bottom of the window so you know exactly what to change!](https://cdn-images-1.medium.com/max/800/1*4MBJPbgv3IBN6zPvfZpyLw.gif)
I took a project I did before using Prettier. Saved it. Whoah! See all that red on the left hand side? That’s Ale doing its magic! You’ll also get the rule instructions at the bottom of the window so you know exactly what to change!

Install using the Plugin Manager of your choice. I like Vim Plug.

Plug 'w0rp/ale'

**Why I personally like this:
**Prettier handles your source code styling, but there’s still a lot eslint can do for you! Stuff like accessibility and removing unused modules and vars should still handled by eslint. Pair with a library like [prettier-eslint](https://github.com/prettier/prettier-eslint) by [Kent C. Dodds](https://medium.com/u/db72389e89d8) & friends makes this an awesome part of your workflow!

See more at [https://github.com/w0rp/ale](https://github.com/w0rp/ale)

#### 5. Deoplete — Auto Completion Framework

This will add an autocomplete dropdown for your files. It works asynchronously. You _will_ need Neovim and Python 3 installed for this to work.

![Look! Autocomplete!](https://cdn-images-1.medium.com/max/800/1*fE_2XywJM9EcfK6eXgTT-g.gif)
Look! Autocomplete!

Vim Plug Installation:

```sh
Plug 'Shougo/deoplete.nvim', { 'do': ':UpdateRemotePlugins' }
```

Before continuing with the next steps, verify that you need to. Open up Neovim and run `:echo has("python3")` If the return value is 1, you don’t have to do anything else! Otherwise, keep following along:

```sh
pip3 install neovim
pip3 install --upgrade neovim (0.1.8 is required)
```

Add the following to your Neovim init.vim file:

```sh
let g:deoplete#enable_at_startup = 1
```

See more at [https://github.com/Shougo/deoplete.nvim](https://github.com/Shougo/deoplete.nvim)

#### Bonus 5.5 — Flow Autocompletion with Deoplete

Love flow-type and wish you could use autocompletion? [Wojtek Czekalski](https://twitter.com/wokalski) _just_ created an awesome library to make it happen!

```sh
" Place deoplete first, then autocomplete-flow
Plug 'Shougo/deoplete.nvim', { 'do': ':UpdateRemotePlugins' }
Plug 'wokalski/autocomplete-flow'

" You will also need the following for function argument completion:
Plug 'Shougo/neosnippet'
Plug 'Shougo/neosnippet-snippets'
```

See more at [https://github.com/wokalski/autocomplete-flow](https://github.com/wokalski/autocomplete-flow)

#### Closing Thoughts

Like I said, I’m constantly looking for ways to improve my own flows. Is there something I’m missing? Would you love to learn more?

Feel free to [tweet me](https://twitter.com/peterpme) or [check out ALL my Vim plugins here.](https://github.com/peterpme/dotfiles/blob/master/config/nvim/init.vim)

