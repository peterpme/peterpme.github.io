---
title: "Running LLMs locally is for tinkerers"
description: "I spent a day running Qwen3.8 on a 128 GB M4 Max. Here's what I learned about attention, Q, K and V, the KV cache, where 90 GB of memory goes, and why a Mac loses to a CUDA GPU. Unless you love to tinker, local models are a bad bet for real work."
date: 2026-11-14T06:00:00.000Z
categories: AI
draft: true
keywords:
  - local LLMs
  - attention
  - QKV
  - softmax
  - KV cache
  - unified memory
  - memory bandwidth
  - Apple Silicon
  - MLX
  - CUDA
  - MTP
  - speculative decoding
  - quantization
  - mixture of experts
  - Qwen3.8
---

A Reddit post claimed you could run Qwen3.8-Flash-Next, a 126B parameter open model, on a Mac at 80 tokens per second. I have an M4 Max with 128 GB of memory, so I spent a day trying.

It worked. It also froze my laptop, ran out of memory in the middle of a chat, filled my disk, and took almost two minutes to answer a one-line question inside a coding agent. By the end of the day I'd deleted it.

I don't regret a minute of it. I learned more about how these models actually work in one day of breaking things than in two years of calling APIs. But my takeaway is simple: **unless you love to tinker, running models locally is a bad bet for practical work.** Here's everything I learned, and why I landed there.

## A model is a pile of numbers

An LLM is mostly a giant set of learned tables (matrices). "27B" means 27 billion numbers in those tables. These numbers are the **parameters**, also called the **weights**. "Open weights" means the lab published the files with those numbers in them.

The memory math follows from that:

- Memory ≈ number of parameters × bytes per number.
- At 16 bits, each number is 2 bytes, so 27B parameters is about 54 GB.
- At 4 bits, each number is half a byte, so the same model is about 14 GB.

Squeezing numbers into fewer bits is called **quantization**. It's lossy, but less than you'd think. Unsloth measures how often a 4-bit model picks the same next token as the full 16-bit one, and for this family it's in the low 90s (percent). Below 3 bits it falls off quickly. 4-bit is the sweet spot almost everyone runs locally.

Here's what happens to your text on the way through, with the real numbers from Qwen3.8-27B's config:

```
"The cat sat because it was tired"
   │ tokenizer
   ▼
[464, 3797, 3332, 780, 340, 373, 10032]     token IDs
   │ embedding table (parameters)
   ▼
each token → a list of 5,120 numbers        its "meaning vector"
   │
   ▼  × 64 layers, each with two halves:
   │    ① attention:     tokens look at each other
   │    ② feed-forward:  each token is processed on its own
   ▼
last token's vector → a score for every word in the vocabulary → pick the next one
```

Then the new token gets appended and the whole thing runs again. One token at a time.

## Attention, and what Q, K and V actually are

The word "it" means nothing on its own. To understand it, the "it" token has to pull in information from "cat". Attention is how each token decides **which earlier tokens to look at, and how much**.

The name comes from a 2014 translation paper, where the model learned which source words to pay attention to while writing each translated word. The 2017 paper that kicked off modern LLMs was literally called *Attention Is All You Need*.

Each token turns its meaning vector into three new vectors:

- **Query (Q):** what am I looking for? For "it", something like "a noun I could refer to".
- **Key (K):** what do I contain? For "cat", something like "animal, noun, subject of the sentence".
- **Value (V):** what I'll hand over if you pick me.

It's a soft version of a lookup in a hash map. Instead of finding the one key that matches exactly, the query is compared against every key and gets a blend of all of them, weighted by how well each one matched.

![Attention for the token "it": its query is compared with every earlier key, softmax turns the scores into weights, and the output is mostly the value of "cat"](/images/running-llms-locally-is-for-tinkerers/attention.svg)

For the token "it":

1. **Compare.** Multiply its query with each earlier token's key (a dot product). That gives one score per token. Bigger means a better match.
2. **Softmax.** Turn the scores into weights that are positive and add up to 1.
3. **Blend.** Take the weighted average of the values. The "it" vector now mostly carries "cat" information.

### Softmax, in one example

Raw scores can be anything: −3, 0.5, 12. A weighted average needs weights that are positive and add up to 1. Softmax does that by raising *e* to each score and dividing by the total:

```
scores   cat 2.0   sat 1.0   the 0.0
e^x      7.39      2.72      1.00      total 11.11
weights  0.67      0.24      0.09      adds up to 1
```

The exponential exaggerates the biggest score, so it behaves like a soft version of "pick the max". Hence the name. It mostly picks "cat" but keeps a little of everything, and it's smooth, which matters for training.

### Where the parameters are

This was the part that confused me the most. The attention weights (0.67 on "cat") are **not** parameters. They're computed fresh for every sentence.

The parameters are the tables that *produce* Q, K and V. Each layer has a query table, a key table, a value table, and one more to combine the result. Multiplying a token's 5,120 numbers by the query table gives its query vector. The key and value tables work the same way with different numbers.

Nobody programs "pronouns look at nouns." Training starts with random tables, has the model predict the next token over trillions of tokens, and nudges every number in the direction that would have made the right answer more likely. The Q and K tables end up matching pronouns to nouns because doing that helps predict the next word.

### Multi-head

All of this happens many times in parallel. Qwen3.8-27B splits each token into 24 query **heads** of 256 numbers. Each head runs its own comparison, so each one can look for something different: one tracks what a pronoun refers to, another the previous word, another where the verb is. Nobody assigns those roles. They come out of training.

## The KV cache is what fills your memory

When the model writes token 1,001, it needs the keys and values of tokens 1 through 1,000. Those don't change, so there's no reason to recompute them. The model saves them. That saved set is the **KV cache**, and it's literally named after K and V.

The cache is why a long chat costs memory. Here's the real math for Qwen3.8-27B:

- It has 64 layers, but only 16 of them use full attention.
- Each of those layers stores 4 key heads and 4 value heads of 256 numbers per token. (Several query heads share one key and value head to save memory. That trick is called grouped-query attention.)
- 16 layers × 4 heads × 256 numbers × 2 (key and value) × 2 bytes = **64 KB per token**.
- A 128K-token conversation is **8 GB** of cache, on top of the weights. I stored it at 8 bits instead, which halves that to 4 GB.

The other 48 layers use **linear attention**. Instead of keeping every earlier token's keys and values, they keep a fixed-size running summary that gets updated with each token. Think taking notes instead of rereading the whole book. That summary stays the same size no matter how long the chat gets, but it can lose exact details. Mixing a few full-attention layers in with many cheap ones is the hybrid design most new models are moving to.

If all 64 layers used full attention, the same 128K chat would need 32 GB of cache. That's why so much research right now is about attention: it's the part that grows with your context.

### Reusing the cache across requests

The cache also makes the *next* request cheaper. If a new request starts with exactly the same tokens as an earlier one, the server reuses the saved keys and values for that part and only processes the new tokens.

"Exactly" is the important word. One changed token early in the prompt, like a timestamp, invalidates everything after it. This is the same thing cloud providers sell you as **prompt caching**: cheap cache reads, more expensive cache writes, and an expiry measured in minutes, because a 100K-token cache for a frontier-size model is tens of GB sitting in very expensive GPU memory.

Locally, the cache lives in RAM while the server runs and can be saved to the SSD. There's no timer and no price. The only limits are your RAM and your disk. My SSD cache grew to 8.2 GB in a few hours, at about 1.2 GB per saved 10K-token prompt, and only 2 of 8 saved prompts were ever reused.

## Where 90 GB went

Qwen3.8-Flash-Next held about 87 GiB of memory at peak. Here's where it went.

**The model itself, about 83 GB.** It's a **mixture-of-experts** (MoE) model: 126B parameters in total, but only about 6B are used for any one token. Each layer has 512 small "expert" networks, and a router picks about 10 of them per token. That's why it's fast: each token only does the math for 6B parameters.

The catch is memory. The router picks **different experts for every token in every layer**, and you can't know in advance which ones the next token will need. So all 512 experts in every layer have to sit in memory, ready. An SSD is far too slow to load them on demand. You pay memory for 126B parameters and get speed as if it were 6B.

**Working memory on top.** The KV cache, scratch space for the math while reading a long prompt, and the speed-up trick's own state. A short chat brought the total to 87 GiB. A long one went higher.

![The 128 GB memory pool: macOS and apps, the 83 GB model, cache and scratch space, and how little is left over, compared with the 27B model at about 20 GB](/images/running-llms-locally-is-for-tinkerers/memory.svg)

**Why it fought my other apps.** On a Mac, the CPU and GPU share **one pool of memory**. That's Apple's "unified memory," and it's the whole reason a laptop can load a model this big at all. A consumer NVIDIA card has its own separate memory, 32 GB on an RTX 5090, and the model has to fit in that.

But one pool means the model's 87 GB came out of the same 128 GB as Brave, Xcode, the iOS Simulator, Slack and macOS. When the pool ran low, macOS started compressing memory and swapping to disk, and the model server started refusing requests to protect itself. In the coding agent, that looked exactly like the model being slow. It was actually running out of memory, getting refused, and retrying.

When I stopped the server, free memory jumped from 21% to 88%. About 9 GB had already been pushed into swap, which macOS keeps until those pages are needed again or the Mac restarts.

## Why speed is a memory problem, not a compute problem

This was the most useful thing I learned all day.

To write **one** token, the model does a multiply against every weight it uses. That means reading every one of those weights from memory, once per token. For a dense 27B model at 4 bits, that's roughly 14–20 GB of reading per token. The math itself is tiny compared to the reading.

So the speed limit for writing text is:

```
tokens per second ≈ memory bandwidth ÷ bytes read per token
```

The M4 Max reads memory at 546 GB/s. Qwen3.8-27B takes about 20 GB in memory, so the ceiling is around 27 tokens per second. I measured **21.9**. The ternary Bonsai version of the same model squeezes it into about 9 GB, and it ran at **33.3**, faster because there's less to read.

It's also why MoE models feel fast locally. Flash-Next only reads its ~6B active parameters per token, so despite being almost 5x bigger in total, it wrote faster than the dense 27B.

### MTP: getting more than one token per read

If reading the weights is the bottleneck, the trick is to get more than one token out of each read. That's **speculative decoding**, and the version these models ship with is called **MTP** (multi-token prediction).

A small extra head on the model cheaply guesses the next few tokens. The full model then checks all the guesses in a single pass, which costs about the same as writing one token because it's still one read of the weights. Every guess that matches what the model would have written anyway gets kept. The output is identical to running without MTP. It just shows up faster.

On my Mac:

- Qwen3.8-27B: 21.9 tok/s without MTP, **60.9** guessing 2 tokens ahead.
- Bonsai 27B: 33.3 tok/s without MTP, **67.6** guessing 1 ahead.
- Flash-Next: 33.1 tok/s without MTP, **82.2** guessing 3 ahead.

Guessing further ahead isn't always better. Every wrong guess is wasted work, and the best depth was different for each model.

## The half nobody talks about: reading your prompt

Writing tokens is the half everyone benchmarks. Reading the prompt first, called **prefill**, is the half that actually hurt.

Prefill is different. The model processes all of your prompt's tokens at once, so it reads each weight once and uses it for thousands of tokens. That makes it limited by raw compute instead of memory speed. And raw compute is where a laptop GPU falls furthest behind a datacenter one.

It matters because an agent's prompt is mostly setup. My coding agent, Pi, sends its system prompt, every tool description, my skills and my global `AGENTS.md` before my message. For a one-line question that was **21,284 tokens**. The 27B model read them at roughly 200 tokens per second, and the answer took **109 seconds**.

I cut the setup down to 2,162 tokens by turning off extensions, MCP tools, skills and context files. Same question: 12 seconds, or 2 with the model already loaded. Fast, but now it's an agent without any of my tools.

A cloud API reads that same prompt on datacenter GPUs, many times faster, and the next request reads it from the cache.

## Mac vs CUDA

So why is an NVIDIA GPU so much better at this? Four gaps, and one thing the Mac has going for it.

![Memory bandwidth compared: M4 Max, RTX 5090, H100 and B200, with what each means for a 20 GB model's best-case tokens per second](/images/running-llms-locally-is-for-tinkerers/bandwidth.svg)

**1. Memory speed.** Writing tokens is limited by how fast memory can be read. The M4 Max reads at [546 GB/s](https://support.apple.com/en-us/121553). An RTX 5090 reads at [1,792 GB/s](https://images.nvidia.com/aem-dam/Solutions/geforce/blackwell/nvidia-rtx-blackwell-gpu-architecture.pdf). Datacenter GPUs use HBM, memory stacked right beside the chip: [3.35 TB/s](https://www.nvidia.com/en-us/data-center/h100/) on an H100 and about [8 TB/s](https://www.nvidia.com/en-us/data-center/dgx-b200/) on a B200.

You can see it in the community llama.cpp benchmark, which runs the same small model (Llama 2 7B at 4 bits) everywhere. The M4 Max writes [83 tokens per second](https://github.com/ggml-org/llama.cpp/discussions/4167). The RTX 5090 writes [290](https://github.com/ggml-org/llama.cpp/discussions/15013). That's 3.5x, almost exactly the 3.3x difference in memory speed.

**2. Compute, which is where it gets ugly.** Apple doesn't publish GPU FLOPS. The best estimate for the M4 Max is around 16–18 trillion operations per second at 16 bits, and its GPU has no dedicated matrix units. NVIDIA GPUs have tensor cores built for exactly this math: about 210 TFLOPS on an RTX 5090, about 990 on an H100, about 2,250 on a B200 (16-bit, without NVIDIA's sparsity trick).

Prefill is compute-bound, so this is where the gap shows. In the same benchmark, reading a 512-token prompt, the M4 Max does 886 tokens per second. The RTX 5090 does **14,073**, 16x faster. The H100 does 9,918.

My 27B model needs about 55 billion operations per token of prompt. At the 200 tokens per second I measured, that's around 11 TFLOPS, most of what the chip has. There's no setting that fixes that.

Apple knows. The M5 chips added what Apple calls a [Neural Accelerator in every GPU core](https://developer.apple.com/videos/play/wwdc2026/330/), "designed to accelerate dense compute-bound work such as the prefill stage of an LLM," and Apple claims the M5 Max reads prompts [up to 4x faster](https://www.apple.com/newsroom/2026/03/apple-introduces-macbook-pro-with-all-new-m5-pro-and-m5-max/) than my M4 Max. That's a big jump, and it still leaves a laptop well behind a single gaming card.

**3. Software.** Almost everything serious is built for CUDA first. [vLLM](https://docs.vllm.ai/en/latest/getting_started/installation/cpu.html), the most popular serving engine, only has experimental CPU support on a Mac, with GPU support through a community plugin. TensorRT-LLM is NVIDIA-only, and [FlashAttention](https://github.com/Dao-AILab/flash-attention), the standard fast attention kernel, doesn't mention Metal at all. The low-precision formats datacenters run on, like FP8 and NVIDIA's [NVFP4](https://developer.nvidia.com/blog/introducing-nvfp4-for-efficient-and-accurate-low-precision-inference/), run in hardware on NVIDIA's newer chips. On an M4 Max they get unpacked in software.

The Mac does have good tools. Apple's [MLX](https://github.com/ml-explore/mlx) and llama.cpp both work well, and MTPLX, the server I used, is built on MLX. But it's a smaller world, and I spent a good chunk of the day on config bugs that nobody had hit yet.

**4. Batching, the gap you can't buy your way out of.** A server reads the weights once per step and computes the next token for every user in the batch at the same time, say 64 of them. The weights are shared; each user's KV cache is their own. Since the GPU was mostly waiting on memory anyway, the extra users are almost free.

So a datacenter GPU does one read of the weights for 64 people. My Mac does one read for one person, me, and then sits idle while I read the answer, still holding 20 to 90 GB of memory. That's the real reason cloud tokens are so cheap, and it's why "fast mode" tiers cost more: fewer users share each read.

**The Mac's one real advantage: a lot of memory in one quiet box.** My MacBook has 128 GB that the GPU can use. An RTX 5090 has 32 GB and needs a whole PC around it. An H100 has 80 GB and rents for about [$4.89 an hour](https://lambda.com/pricing). The 126B model I started with doesn't fit on any single consumer NVIDIA card. On my laptop, it just loaded.

NVIDIA's answer is the [DGX Spark](https://www.nvidia.com/en-us/products/workstations/dgx-spark/), a small desktop with the same 128 GB of unified memory. It reads memory at 273 GB/s, half the speed of my Mac, so it writes text slower (57 tokens per second in that benchmark), but it reads prompts more than 3x faster because it has tensor cores.

So the Mac is big memory, middling memory speed and weak compute. That's fine for one person chatting with a big model. It's bad for agents, which send huge prompts on every turn.

## When local actually makes sense

I'm not saying never. Local wins for a few specific jobs:

- **Privacy.** Client code, personal documents or anything that can't leave the machine.
- **Offline.** Planes and bad Wi-Fi.
- **A fixed baseline.** A local model never changes under you. No silent upgrades, no new default effort settings, no serving bugs. When people say a cloud model "got dumber," a frozen local model is a way to actually test that.
- **Learning.** Nothing taught me how this works like watching my own laptop run out of memory.

For everything else, the numbers aren't close. A frontier model is smarter, handles 1M tokens of context, reads a 21K-token agent prompt without making me wait, and costs my laptop nothing. Even on price, a small cloud model like Haiku costs about a dime per million input tokens, which undercuts most of the cost case for running your own.

I kept two small models on my laptop, the 27B and its 9 GB Bonsai sibling, as an emergency kit. They start with one command, shut down when I close the session, and take 20 GB instead of 90. That's where I think local belongs right now: a backup and a hobby. If you love tinkering, it's one of the best ways to learn how LLMs work. If you just want to get work done, use the cloud.
