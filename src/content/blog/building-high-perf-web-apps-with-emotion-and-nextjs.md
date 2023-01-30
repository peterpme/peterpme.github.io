---
title: Building High Performance Web Apps with Emotion and Next.js
date: 2017-06-07T05:00:00.000Z
categories: [Emotion, Styled Components]
---

If you haven’t heard of Emotion yet, it’s one of the fastest CSS-in-JS libraries to date. Its API is similar to styled-components but delivers your stylesheets over 200x faster. If you don’t believe me, check out @tkh44’s article here or the benchmarks you can run on your own here.

Under the hood, Emotion uses a babel plugin to parse your CSS and constructs style blocks from your components. It reads those blocks with PostCSS, manipulates them and writes template literals back with babel. It’s the reason why Emotion is so fast: it takes care of all the expensive operations like parsing nested rules and prefixes ahead of time.

When you combine an awesome server-rendered experience like Next.js with Emotion, you get a high performant website right out of the box.

#### Installation

The easiest way to get started is by using `create-next-app` to generate a brand new project.

`create-next-app` takes the same approach `create-react-app` does but it generates a Next.js project instead. It’ll install all the dependencies you need ahead of time and put together the base project.

Run the following to get yourself started with Next.js and Emotion:

- `yarn global add create-next-app` or `npm install -g create-next-app`
- `create-next-app hackernews`
- `cd hackernews`
- `yarn add emotion` or `npm install —-save emotion`

#### Yarn

`yarn` is an alternative package manager to `npm` that strives for high performance and security. You can read more about it at [yarnpkg.com](<[https://yarnpkg.com](https://yarnpkg.com)>) or get started with it right away by running `brew update && brew install yarn` in your terminal.

#### Configuration

For Next.js and other server-rendered libraries, Emotion requires an additional step of adding an `inline-mode` configuration to your babelrc. If you were using `create-react-app` or a single page app with no server rendering, you could skip this step.

#### Extract vs. Inline Mode

Extract is how Emotion works out of the box. It’s the “high perf” setting if you’re not worried about IE11 or below and aren’t doing any server rendering. The reason why its faster is because it skips the prefixing step older browsers require.

Inline Mode is the “safety net” setting that is just a smidge slower but supports every browser React does and supports server rendering. If you’re developing for a wide audience of people and browsers, this is the mode you want to go with.

#### Getting Started

Emotion supports almost every technique and API you’ve loved when it comes to CSS-in-JS libraries including raw CSS files. It makes porting your project over from virtually anything a breeze!

```javascript
const Avatar = styled(‘img’)`
 width: 100px;
 height: 100px;
`
```

#### Final Thoughts

I love Emotion because it supports a lot of the same features I was looking for when comparing different CSS-in-JSS libraries except offering incredible performance we all strive to achieve.

