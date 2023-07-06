---
title: Some thoughts about Practical AI Tooling
date: 2023-07-06T00:54:35.875Z
---

I think I have a couple of ideas for what some of the tooling, infrastructure or products around AI might look like in the future. This could already exist but nothing that I've heard of quite yet.

## Model Hosting
The ability for a user to own their own model. Many of the services you see ask you to upload the same 15-20 photos over & over and they all share the same model and most likely train it the same way.

What if we could save ourselves a ton of time & space and just point to the same model? The "secret sauce" required by these products still exist: they have their own seed phrase, etc but now instead of taking 60-120 minutes training, you just go straight into generating.

## Indexing Service
Langchain has made it much easier to build conversational chat bots. There are so many ways of splitting different files, texts, etc that you might spend a lot of time trying to optimize it. If there was one great way to split a markdown file, we'd all use it, but alas, we have 10 different types of text splitters with their own variables, etc.

## GPU Cloud Services
You can rent a $35,000 GPU for 50 cents an hour: an incredible achievement. What folks still struggle with is how to train the data you want. There are so many different techniques for training a lora, or checkpoints, etc.

Instead of having to rent your own GPU, upload your own photos, why don't you give us all of that and we'll figure out the most optimal way to do it?

## Pull Request Indexing
I think it's fair to say that even Google, the indexing giant, would have a hard time indexing all of your data immediately for consumption. Also, if your knowledge or codebase is private, then nearly impossible to index it at all.

That means, you will need to create some form of a pipeline to keep your conversational bot up to date. I can imagine creating flows for indexing services to run on pull requests or commits, so the info stays relevant. I can also see a future where we set different markers in our documnetation so these indexing services have a better idea of how to chunk it, etc.
