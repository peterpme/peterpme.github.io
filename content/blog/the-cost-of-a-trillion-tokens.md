---
title: "What 1.5 trillion tokens a month actually costs"
description: "I said 1.5T tokens a month costs $132M a year. It's closer to $500k a month. How prompt caching, cache reads and writes actually bill you, what 27B tokens of my own usage looks like, and why the gap still matters."
date: 2026-11-07T06:00:00.000Z
categories: AI
keywords:
  - tokens
  - prompt caching
  - cache reads
  - cache writes
  - Cursor
  - Claude Code
  - Codex
  - Grok Bot
  - AI costs
  - agent costs
  - context compaction
---

I stumbled over a [Cursor profile](https://cursor.com/@lauren) that processed 1.5T tokens in 30 days and I couldn't wrap my head around it. That is literally 55x more than my best month of 27B and I'm running agents 24/7!

So I did what any aspiring ai maxi would do: I [tweeted about it](https://x.com/peterpme/status/2107847615463219252). After doing some sloppy math I said those tokens cost $132M a year. The post went viral. So viral that Theo made a [30m video](https://www.youtube.com/watch?v=FHGfSjDGUIw) about how wrong I was ([and I was](https://x.com/theo/status/2107924138094703084)).

Watching that video hurt but getting it wrong and misunderstanding hurt more so I went on a mission to figure out how tokens are actually billed across providers.

**TLDR: at a blended rate, 1.5T tokens costs about $500k a month.**

I was off by 20x because I wasn't accounting for cache. It turns out around 97% of an agent's tokens only cost five cents on the dollar, and I had priced every one of them at full price (I did leave this caveat but the headline is what sells).

The gap I was gesturing at got obscured by a bad number so I'm here to admit that I'm wrong and move on to the more interesting bits.

There is a class of engineer running agents at scale I can't even begin to comprehend at a cost that runs more per month than a startup's entire payroll.

That productivity gap between lab engineers and the rest of us is the question I care about and I think it's a lot more interesting than the $132M number because hopefully our day of token maxing will soon come too.

But until then, let's learn about how the labs calculate the cost of your slop.

## A token count is four different numbers added together

Similar to a stateless server, the model has no memory. At every turn the harness includes the entire message history: the system prompt, your request, every file it read & every command it ran. It’s one big array that gets appended to every time you send a message.

Caching is the provider agreeing to keep a copy of that data for a few minutes so you don't have to pay full price for them to read the whole thing over again.

So when a dashboard says you used a trillion tokens, it's summing four categories that are billed at different rates:

| Category | What it is | Price |
| --- | --- | --- |
| Uncached input | Text the model has never processed before | Full input price |
| Cache writes | Text stored in the prompt cache so later turns can reuse it | 1.25x input for a 5-minute cache, 2x for 1 hour (Claude) |
| **Cache reads** | Text replayed from that cache instead of processed again | 5% of input on Opus and Sonnet 5.5, 10% on most others, 25% on Grok 4.7 in Cursor |
| Output | What the model writes back, thinking included | The most expensive |

Cache reads are the important one.

Cursor's dashboard and public profiles report the sum of all four according to Cursor's Kevin Neilson on their [forum](https://forum.cursor.com/t/discrepancies-between-cursor-cli-usage-and-billing/164471).

Lauren hasn't said what hers cost and probably can't bc it's an internal number for a company that owns the inference. Everything below is "what this would cost at list price", which is the only version of the question anyone like me can answer.

## How caching actually bills you

Say you're using Opus 5.5 ($4/M in, $5/M to cache-write for 5 minutes, $8/M for an hour, $0.20/M to cache-read) and your agent is 500k tokens deep.

The first request writes the whole 500k to the cache: $2.50 (or $4.00 on the 1-hour cache).

Every turn after that re-reads it for $0.10, plus a couple of cents to file the new tool result, and each read resets the timer, so a busy session never expires.

Then you go to lunch. You're gone for an hour. The timer runs out, your next turn finds the cache empty and the whole 500k is written again: another $2.50.

The expensive event in an agent session isn't the reading. It's the rebuild.

![What one agent session costs turn by turn: cheap reads, then a $2.62 rebuild after the cache expires](/images/the-cost-of-a-trillion-tokens/session-timeline.svg)

Plain input ($4/M) and a cache write ($5/M) are the same work for the model: it reads the tokens and builds its state either way.

That extra $1 is a storage fee for keeping that state around.

In a typical harness like Claude Code or Codex almost everything is cached. For example, my Cursor account has literally 2 uncached tokens out of billions.

The one place caching doesn't happen is small requests. OpenAI won't cache a prefix under 1,024 tokens and Anthropic won't cache under 512 to 4,096 depending on the model.

So stuff like "translate this sentence" gets processed and discarded every time, by design, because storing it would cost more than it could ever save.

Kind of clever.

### Reasoning is paid once

Thinking tokens are billed as output, at the full output price, the moment they happen. There's no discount for the fact that you never see them: on Opus 5.5 a 3,000-token think costs the same 6 cents as 3,000 tokens of visible reply, at $20/M, the most expensive number on the price card.

So the higher the reasoning effort, the more you spend per turn. But Anthropic strips earlier turns' thinking out of the context before the next request, so you never re-read your own reasoning.

It's a one-time charge, not something that compounds through cache reads.

## Why cache reads end up being almost all of it

Because the whole history goes back every turn. Only the newest tool result and the newest reply are fresh on any given turn; everything else hits the cache.

A task that takes 200 turns re-reads its context 200 times, so the token count grows with roughly the square of the session length. The bill mostly doesn't, because the reads are cheap.

Every published log I found comes out around 97%. My own logs say about that too depending on the tool.

This is the whole mistake in one sentence: I took a number that was 97% cache reads and priced it as if it were 100% fresh input and output.

## How token costs are calculated

The formula is one line, with token counts in millions:

<div class="formula" role="math" aria-label="Cost equals reads times read price plus writes times write price plus input times input price plus output times output price"><span class="formula-lhs">Cost</span><span class="formula-op">=</span><span class="formula-term"><var>reads</var><span class="formula-times">×</span><var>p<sub>read</sub></var></span><span class="formula-op">+</span><span class="formula-term"><var>writes</var><span class="formula-times">×</span><var>p<sub>write</sub></var></span><span class="formula-op">+</span><span class="formula-term"><var>input</var><span class="formula-times">×</span><var>p<sub>in</sub></var></span><span class="formula-op">+</span><span class="formula-term"><var>output</var><span class="formula-times">×</span><var>p<sub>out</sub></var></span></div>

Cursor Teams and Enterprise pay an extra $0.25/M on top of the list price which is how they’re probably worth $60B.

There's no public evidence of a discount in either direction, and as the rest of this shows, you don't need one to explain the gap.

| Model | Input | Cache write | Cache read | Output |
| --- | ---: | ---: | ---: | ---: |
| [Claude Opus 5.5](https://platform.claude.com/docs/en/about-claude/pricing) | 4.00 | 5.00 | 0.20 | 20.00 |
| [Claude Sonnet 5.5](https://platform.claude.com/docs/en/about-claude/pricing) | 2.00 | 2.50 | 0.10 | 10.00 |
| [Claude Fable 5.1](https://platform.claude.com/docs/en/about-claude/pricing) | 10.00 | 12.50 | 0.25 | 50.00 |
| [GPT-6.1 Sol](https://developers.openai.com/api/docs/pricing) | 2.00 | 2.50 | 0.10 | 10.00 |
| [Gemini 3.1 Pro](https://ai.google.dev/gemini-api/docs/pricing) | 2.00 | 2.00 | 0.20 | 12.00 |
| [Grok 4.7](https://cursor.com/docs/models) (in Cursor) | 2.00 | 2.00 | 0.50 | 6.00 |

Gemini and Grok don't charge a premium to write the cache. The first pass bills as normal input.

**An example from my own Cursor export**

One Opus 5.5 request, line by line:

| | Tokens | Price per 1M | Cost |
| --- | ---: | ---: | ---: |
| Cache reads | 93,934 | $0.20 | 1.88¢ |
| Cache writes | 642 | $5.00 | 0.32¢ |
| Uncached input | 2 | $4.00 | 0.00¢ |
| Output | 2,486 | $20.00 | 4.97¢ |
| **Total** | **97,064** | **$0.74** | **7.17¢** |
| Priced like my tweet | 97,064 | $8.00 | 77.65¢ |

About 7 cents, or $0.74/M. Priced the way I priced the tweet, the same request comes out to 78 cents.

## What 27 billion tokens of my own usage looks like

| Tool | Tokens (30d) | Cache reads | List price | $/M |
| --- | ---: | ---: | ---: | ---: |
| Claude Code | 16.1B | 97% | $5,368 | 0.33 |
| Codex | 5.4B | 96% | $1,091 | 0.20 |
| Cursor | 4.7B | 93% | $3,164 | 0.68 |
| Grok CLI | 1.0B | 93% | $650 | 0.64 |
| **Total** | **27B** | **96%** | **$10,300** | **0.38** |

Three things fall out of my own data:

- **The shape is the same on every tool.** Around 96% cache reads whether it's Claude Code, Codex, Cursor or Grok. This is how agents work, not a quirk of one vendor.
- **Ironically, Grok is the expensive option for this workload.** On my Cursor account Grok cost about $0.80/M against $0.56/M for Opus 5.5, because of its 50 cent cache read. I would have assumed Grok was the cheap path. When almost everything is a cache read, it isn't.
- **Model choice, not volume, is where the money goes.** Fable 5.1 was about 5% of my Claude tokens and about a quarter of the cost. Grok's Fast mode doubled my per-token rate for a month. The same tokens cost 4x more or less depending on which model read the cache.

## So what does 1.5 trillion tokens a month cost?

Same formula, with 1.5 trillion tokens split the way agent sessions split: about 98% cache reads, under 2% cache writes and 0.3% output. Priced on Opus 5.5, one of the models on her profile:

| Scenario | $/M blended | Per month | Per year |
| --- | ---: | ---: | ---: |
| What I posted | 8.00 | $12.0M | $144M |
| Opus 5.5 | 0.34 | $511k | $6.1M |
| My own blend, scaled up | 0.38 | $570k | $6.8M |

Where the money goes in the Opus 5.5 case: cache reads $294k (57%), cache writes $125k (25%), output $90k (18%), uncached input $2k.

Reads are 98% of the tokens and 57% of the dollars. Output is 0.3% of the tokens and 18% of the dollars.

The cache-read price decides the answer, because almost every token is a read. Opus 5.5 reads at 20 cents a million. A model that reads at 50 cents, like Grok 4.7, lands closer to $800k.

Grok 4.7 does not seem like a model worth using anymore but that’s a different story.

Which model you pick matters more than anything else in the formula.

## Is half a million a month actually a lot?

Ya. That's what I was really trying to say.

| Last 6 months | Figure |
| --- | --- |
| Jensen Huang's benchmark ([All-In, March 2026](https://www.rdworldonline.com/nvidia-ceo-jensen-huang-says-spend-250k-on-ai-tokens-annually-or-hell-go-ape/)) | a $500k engineer should burn at least $250k a year in tokens, or he'd be "deeply alarmed" |
| OpenAI's heaviest internal user ([Altman, June 2026](https://finance.yahoo.com/sectors/technology/articles/sam-altman-says-openais-top-163224801.html)) | about 100 billion tokens a month |
| Theo, by his own account (Oct 2026) | goes hard and can't reach 100B a month |
| Anthropic's enterprise average ([Claude Code docs, updated Apr 2026](https://axify.io/blog/claude-code-token-usage)) | $13 per developer per active day; $150–$250 a month |
| What a Cursor Ultra plan ($200) includes ([panel, Nov 2026](https://github.com/Fei2411/real-api-pricing/issues/195)) | roughly 1.5B tokens of Grok/Composer a week, about 6.7B a month |
| Me, everything, 30 days (Nov 2026) | 27B tokens, about $10k at list |

1.5T a month is:

- 15x more than OpenAI’s top user
- 225x more than Cursor Ultra
- 25x more than Jensen’s token factory suggestions we spend

![Tokens per month on a linear scale: me at 27B, OpenAI's top user at 100B, poteto at 1.5T](/images/the-cost-of-a-trillion-tokens/tokens-ladder.svg)

**The counterargument**

Theo's strongest point is that this number is temporary. The cost of a fixed level of intelligence has been falling 10–100x a year: Artificial Analysis has Sonnet 4.5 at 56 cents per task in September 2025 and GPT-6 Luna matching its score at 0.45 cents a year later; his own Skate Bench had o1 at 12 cents a question in December 2024 and Gemini 3 Flash beating it at 0.2 cents exactly a year later.

On that curve, he argues, today's $500k of Opus 5.5 is $3,000 a month in a few months and $100–$1,000 within a year. He's right about the curve.

But the people running 1.5 trillion tokens aren't buying last year's intelligence. They move to the next model the day it ships, and the next model costs roughly what the last one did.

[Theo says this himself](https://www.youtube.com/watch?v=FHGfSjDGUIw&t=915s): you can't complain iPhones aren't getting cheaper when you refuse to buy last year's. So the dollar figure for a frontier user stays about flat while what it buys goes up, and the gap I keep pointing at is a gap in *access to the frontier*.

Falling prices don't close it. They just move it.

One small thing I'd still ask for: nothing in the discourse around these usage numbers mentioned what they cost to run, and I think that's worth a footnote. Maybe that's just me.

## What I'm changing about how I run my own agents

Once you see the bill as reads plus rebuilds, a few things follow. These are the ones I'm actually doing now.

- **Treat the rebuild as the expensive event.** A 500k context on Opus 5.5 is 10 cents to re-read and $2.50 to re-write. Everything below is about avoiding rebuilds.
- **Don't switch models mid-session.** A different model means a different cache; the whole context gets written again. Switch when you come back from a break, not in the middle of a task.
- **Compact right after an idle gap, before the next turn, and ideally before the cache expires.** Compaction breaks the cache no matter when you do it: the summary is a new, shorter prefix that has to be written once. But *producing* the summary means sending the whole context one more time, and that's 10 cents if the cache is still warm and $2.50 if it isn't. So the cheapest moment is after the user walks away and before the shelf life runs out: no quality cost from interrupting mid-thought, the summarization read is cheap, and the next turn starts small. That's exactly what Grok Bot does; in [what actually happens when you message Grok Bot](https://peterp.me/articles/what-actually-happens-when-you-message-grok-bot/) I found it compacts in the background when the context is over 100K tokens and you've been gone 10 to 60 minutes. I thought that was a latency trick. It's a billing trick too.
- **Don't read a screenshot into a long session.** The image sits in the context and gets re-read on every turn after it. Start a fresh session for visual work.
- **Pick the model by its cache-read price, not its input price.** For agent work the read price is 57% of the bill. Opus 5.5 and Sonnet 5.5 at 5% are the efficient ones. Grok 4.7 at 25% is not, whatever the input column says.
- Stop using Grok? Lol

**A dumb trick that works, for fun.** If you didn't want the cache to expire while you were at lunch, you could just keep poking it. Every request re-reads the whole context, and every read resets the 5-minute timer, so a one-character message with a one-token reply is a keep-alive. On a 500k-token Opus 5.5 context that ping costs 500k × $0.20 / 1M = 10 cents. The rebuild you're avoiding costs $2.50. So a ping every 4 minutes 59 seconds keeps the cache warm for $1.20 an hour, and you don't break even against a rebuild until ping number 25, which is about two hours away. For any lunch shorter than that, pinging is cheaper than coming back cold. The ratio is just write price over read price, so it's the same 25 pings on Sonnet 5.5 and only 4 pings, or 20 minutes, on Grok 4.7, where the read is 50 cents and the write is $2. None of this is better than compacting while the cache is warm, which is what Grok Bot does. But it's a nice way to feel the shape of the pricing: reading is so cheap that re-reading everything twelve times an hour costs less than writing it once.

## The part I should have seen: it's marketing, and it's kind of cheap

A public profile showing 1.5 trillion tokens a month, 115k agents and a 215 day streak is not just engineering output. It's the most effective developer-marketing campaign of the year, and it costs, at list, half a million dollars a month that the company was going to spend on internal R&D anyway.

Compare that to what attention normally costs. Theo's point in the video, which I think is right: companies throw events that cost over a million dollars and get less attention than a couple of her tweets.

Even a crypto conference during a bull market that flies in Tiësto for a couple of hours can't get that kind of reach. I know from experience.

My own bad tweet got 472,000 views in a day. The correction got a tenth of that. Every argument about her token count, including this one, is free distribution for SpaceX and Grok Bot.

The tokens improve the product, the usage number becomes the content, and the discourse does the rest.

There is no line item in a marketing budget that performs like that. It's impressive.

So I made a mistake, and the conclusion isn't "she's spending too much." It's that she found a play the rest of us can run at smaller scale, and should: run agents as hard as your plan allows, make the usage visible, and build cool stuff.

I spent a month in a token-count discourse I lost. The version where I win it is the one where I start sharing what I've actually been building. Starting with this.

Thanks to Theo for pushing on the math. He was right, and I'd rather be corrected in public than wrong in public.

## Sources

- [Anthropic — Claude API pricing](https://platform.claude.com/docs/en/about-claude/pricing) (prices, cache multipliers, 5-minute and 1-hour TTLs)
- [OpenAI — API pricing](https://developers.openai.com/api/docs/pricing) (30-minute and 12-hour cache tiers)
- [Google — Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing)
- [Cursor — Models & Pricing](https://cursor.com/docs/models); [Cursor forum — what the Tokens figure sums](https://forum.cursor.com/t/discrepancies-between-cursor-cli-usage-and-billing/164471); [cache-read thread](https://forum.cursor.com/t/why-does-cursor-consume-an-absurd-amount-of-cache-read-tokens/151439)
- [cursor.com/@lauren](https://cursor.com/@lauren)
- [My Oct 7 tweet](https://x.com/peterpme/status/2107847615463219252); [Theo's reply](https://x.com/theo/status/2107924138094703084); [Theo's video](https://www.youtube.com/watch?v=FHGfSjDGUIw)
- Context: [Jensen Huang](https://www.rdworldonline.com/nvidia-ceo-jensen-huang-says-spend-250k-on-ai-tokens-annually-or-hell-go-ape/); [Altman, 100B](https://finance.yahoo.com/sectors/technology/articles/sam-altman-says-openais-top-163224801.html); [Anthropic enterprise averages](https://axify.io/blog/claude-code-token-usage); [Cursor Ultra pool panel](https://github.com/Fei2411/real-api-pricing/issues/195)
- [What actually happens when you message Grok Bot](https://peterp.me/articles/what-actually-happens-when-you-message-grok-bot/) (my earlier piece on its compaction)
