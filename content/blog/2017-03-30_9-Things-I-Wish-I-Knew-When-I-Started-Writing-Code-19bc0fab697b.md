---
title: 9 Things I Wish I Knew When I Started Writing Code
description: >-
  I’ve been paying it forward for the last two years by teaching newer
  programmers how to craft their code. On an informal basis, I’ll guide…
date: '2017-03-30T17:49:12.714Z'
categories: []
keywords: []
slug: /@peterpme/9-things-i-wish-i-knew-when-i-started-writing-code-19bc0fab697b
---

![Photo by Kimon Maritz on unsplash.com](https://cdn-images-1.medium.com/max/1200/1*YqJp40BS2gi9na6ExRrwjQ.jpeg)
Photo by Kimon Maritz on unsplash.com

I’ve been paying it forward for the last two years by teaching newer programmers how to craft their code. On an informal basis, I’ll guide a student through typical, real-world challenges: from thinking through the database structure to reading error messages.

After doing this for a bit, I’ve noticed a common pattern beginners (including myself) face when they’re first starting out. Here are a few tips and tricks to help step up your game:

#### 1. Read every line of code

If you skim code the way you might skim articles (like this one), you might find yourself missing an important piece of the puzzle. You can’t play chess when you don’t see every piece. The same applies to reading code.

> Every line, word and character counts!

Error messages become much less cryptic once you realize you may have misspelled a function or missed a parenthesis.

Fixing that pressing bug will take less time because you’ll understand _exactly_ what is happening.

#### 2. Focus on the abstraction after you understand the abstraction

It’s easy to get ahead of yourself by abstracting out your codebase to a few functions. I suggest you hold off on any abstractions until you absolutely understand the need to.

> Don’t worry about building a system that supports every use case you can think of right off the bat!

Build for one use case first. Then another, then another. The pattern will eventually stick out like a sore thumb and you’ll naturally come to the right abstraction.

#### 3. “Don’t Repeat Yourself” doesn’t mean you need to re-use every function

Don’t Repeat Yourself is a phrase thrown around a lot in programming, but it doesn’t mean you should be throwing it around a lot in practice!

DRY helps you isolate your changes and increase maintainability because you’re only editing a few things to make an impact.

What I’ve noticed is that the DRY principles are being orchestrated on an entire codebase rather than a feature. So, if a site has two different tightly-coupled pages and one of the page layouts change, it also changes the layout of the first page which might not be intended.

I suggest you identify the “core” (won’t change often) and “leaves” (constantly changing) and focus your DRY techniques on core.

Just like with the previously mentioned abstractions, it will take some time and a few “oopsie” experiences to strike the right balance.

#### 4. If you don’t know, ask!

Ask as many questions as it takes for you to understand a problem or a piece of code. Don’t worry about feeling stupid or feeling like you should know the answer.

No matter where you are in your career, you will never completely grasp an entire library, framework or function from the get-go.

Take a look at open source for example. Everyone has different philosophies, coding styles and libraries they like to use. There’s an abundance of them and you’ll never *always* know what every single piece is doing.

At work, you might think you _should_ understand something so you spend an hour or two researching when you could have just tapped the engineer next to you for a quick explanation.

Everyone is entitled to fully understanding the problem before coming up with a solution no matter the skill level.

#### 5. Find a mentor or friend you can go to for help

I owe a lot of my skills to the folks that stuck with me over the years. I went through a lot of trial and error on my own growing up and that was a great experience. That being said, having someone throw you a bone and guiding you down a *better* path is very valuable.

Imagine trying to build something in Javascript and picking up a random set of tools. What you choose might be the right tool for the job, or it may not be. You _might_ spend months or even years working through the kinks only to realize there was a solution that fit your exact needs!

A mentor can help you make those decisions up front.

#### 6. Use Github Search to your advantage

My secret to writing code is spending a TON of time searching Github for the answer I’m looking for. Google and Stack Overflow are great but a lot of times the answer you’re looking for could be framework specific or out of date.

For example, 90% of the answers (I made this % up) on Stack Overflow will give you a jQuery solution when you’re looking for a pure javascript one.

Searching Github for “document.getElementsByClassName” for example, will give you a practical, up-to-date example. If you do your due diligence and make sure the code is being used or has been updated recently, you’ve just got a killer template to work from! Clone it, try it out on your own and see if what it’s doing matches what you’re looking for.

#### 7. Boilerplates can be a trap!

Boilerplates have become popular over the years. They’re usually a set of utilities, patterns and opinions you can use to get started with your project.

It’s easy to reach for one, but you may find yourself in a position where you’re not sure what is going on or how to fix it.

Start with the basics first. Open up a scratch pad like codepen.io or jsfiddle.net and try and understand how something works. Not only will you have a better understanding of the framework, but there’s a good chance that through isolation you’ll learn fundamental parts of a language too.

#### 8. Don’t worry about what your friends are doing

Remember:

*   Everyone learns at their own pace
*   Everyone has different interests in the programming realm

Just because your friend is working on Artificial Intelligence, Machine Learning, Data Science or Web Development doesn’t mean that they’re better than you are. Those are all popular buzzwords that sound crazy but in reality are very approachable as long you just want to give it a shot!

Sure, writing HTML is a lot easier than machine learning but I’d argue that Javascript and UI Development have equal non-trivial challenges.

> Don’t focus on what other people are doing. Focus on yourself!

Even if they are better, you shouldn’t be discouraged. You’ve found yourself writing code because YOU like to write code. Keep it that way :)

#### 9. You’re a gardener, not an engineer

I don’t remember where this idea came from but I’m a huge fan of it.

A civil engineer, for example will build a bridge and move on to his/her next project. There might be maintenance work that takes place every few years, but that’s most likely done by a different division.

A gardener however, nurtures his/her plants over time. You water it on a weekly basis, trim leaves monthly and re-pot yearly.

You can argue that growing plants outside defeats this analogy, but nurturing your plant will improve its chances of success in the wild!

I call myself a gardener because I’m constantly maintaining my code. You should too :)

![Succulents by Brooke Cagle from Unsp](https://cdn-images-1.medium.com/max/800/1*GM5_niBxMouNtsqxRgkBXg.jpeg)
Succulents by Brooke Cagle from Unsp