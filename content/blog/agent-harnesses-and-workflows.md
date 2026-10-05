---
title: "Agent Harnesses & Workflows"
description: "What I've learned using both harnesses and workflows in production."
date: 2026-10-05T13:30:00.000Z
---

Everyone's talking about how harness engineering & dynamic workflows are the future. Static workflows work well too. After building a whole bunch, I think you need both.

You built the harness. It crushed the demo. Then it hit production, burned a billion tokens and left you with nothing but a bill.

So you went the other way: a tight pipeline with hardcoded steps, retries and validation. It was cheap and predictable until it confidently returned perfectly valid JSON that was completely wrong.

Nothing errored or retried and you had no idea.

Most folks seem to be talking about this in absolutes: build a harness or build a workflow. After using both in production for the last few months, I have opinions.

Each one is good at exactly what the other is bad at and the real leverage comes from using them together.

## **Agent Workflows vs Agent Harnesses**

Picture a model that nails the analysis of a trade call: the thesis and position are spot on. The only problem is that it's tied to the wrong security. The source was ambiguous and the model confidently filled in the gap based on the info it was given.

That failure is an example of what I've learned about building AI products. I've found there are two ways to do it and the interesting part is how they work together.

## **Agent Workflows: systems design with LLM calls**

A workflow is just systems design. You treat each LLM call like any other async function in your stack. You decide every step, define the inputs and outputs and handle every way it can fail (or should at least).

If you're lucky, you can get away with one LLM call that gives you the accuracy and consistency you need to go live. In many real world cases though, it never seems to be that easy.

Models time out all the time. They can return the wrong schema. They're not returning the right information. The list goes on.

Retries, validation, fallbacks and post processing are the same reliability work you'd do for any distributed system. It takes a lot of iteration and observability to get there. The payoff is that once it's dialed in, it's the cheapest and most predictable approach you can run at scale.

That's one thing I haven't been able to crack with a workflow: guaranteeing that the information in the PDF/file is actually correct. A workflow can guarantee that you extracted what the source says, but it can't guarantee the source is right, or that you know what it meant.

## **Agent Harnesses: the model owns the process**

A harness is a model with tools and a goal. Think Claude Code or Codex. You ask it for help and it figures out how. It might follow the process you have in mind, or it might not.

Harnesses are slower, more expensive and less predictable than workflows. They can also handle problems you've never anticipated and can do an extremely good job of using tools at their disposal to solve problems that are harder to solve with a workflow.

There are 3 places where I think it's worth it:

## **1. Knowing which security is being discussed**

I work in crypto/finance. Financial names & tokens are a mess. Even in tradfi, a company can have multiple share classes trading under different tickers. One issuer can have dozens of bonds outstanding with different coupons and maturities.

Funds launch with names that differ by one word and one of them turns out to be 3x leveraged. Tickers get reused across exchanges and are recycled after delistings.

Say you're building a market news tracker that reads articles and analyst notes. The extraction is easy. Any model with no/low reasoning can do this. The hard part is that "the company's bonds sold off" or "buy the tech fund" could map to a handful of instruments and picking the wrong one will corrupt the entire approach bc the data is wrong.

No fixed set of rules can answer that reliably. What does work is a harness that does what your brain would do: it takes the same path of discovery through exchange listings, issuer filings, Google and X searches until it finds the highest probability match.

It searches around when the piece was published, because what was moving and making news that day is usually a strong signal for what the author meant.

The key is that the model decides which of those steps it needs. Sometimes the company/token is obvious and doesn't need to search at all. Sometimes it needs three sources before it's confident.

Do you realize how many DOG/CAT tokens exist in crypto?

That's what makes it a harness and not a workflow. You're not coding the path, just giving it the tools and the goal.

## **2. Finding out why the workflow failed**

At Backpack I built an earnings validation pipeline that pulls figures from SEC filings. Getting the filings parsed isn't the hard part anymore, there are plenty of tools out there that'll handle a lot of that.

The hard part is that no two companies report their financials the same way, every time, so even a well tuned pipeline misses, and in the moment we have no idea when it does.

The nice part about earnings data is that the correct answer always gets published eventually. So every week I'll run a retroactive check against the published numbers. For each mismatch, an agent harness spins up on its own. It compares sources, searches around, reads the code and traces the miss back to the cause.

I couldn't get a workflow to do that diagnosis and I think I know why. A workflow needs you to know the failure in advance.

"Why is this EPS wrong" could be a bad table parse, a restatement, diluted vs. basic, GAAP vs. non-GAAP, or something you've never seen. It's a hard if statement to write.

Right now the diagnosis is automatic but the pipeline adjustments are still approved by me. Automating that is next.

Either way, the harness discovers problems and the workflow encodes the fixes. If the harness's caseload isn't shrinking, your pipeline isn't learning.

## **3. Building the answer key**

To know whether any of this works, you need gold labels. Gold labels just mean the perfect version of the data output you're looking for. For a news tracker, that means a set of articles where you know for certain which security each one refers to. Labeling those by hand is a PITA.

A harness can do the first pass. Run the extraction with 2-3 different models with 2-3 different approaches. Probably Astra and Fable, flag where they disagree and have the harness go back to the original source and search around to settle it.

You still review all the results at first, but you're checking its work instead of doing it all by hand. Using independent sources matters here. If the labeler and the pipeline share the same blind spots, your gold sets will also have those errors.

This harness isn't part of the product, it just builds the datasets that build the product.

It's really expensive compared to a workflow. But a pipeline run costs money every time it runs, while a gold label costs money once and grades every future version of your system. It's why getting it right is important.

## **Where I've landed**

Workflows run the hot path in production as much as possible.

Harnesses get called for 3 things:

- cross checking the data
- diagnosing failures
- building gold labels

What the harness figures out eventually makes its way into the workflow with a better set of instructions/tools.

The whole thing depends on one thing: the truth eventually shows up. Earnings get published and agreed upon so double checking the work is easy.

In other tooling I've been working on, it gets a bit more nuanced but that's a story for another day.
