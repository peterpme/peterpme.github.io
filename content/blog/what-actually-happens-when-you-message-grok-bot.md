---
title: "What actually happens when you message Grok Bot"
description: "Always-on AI agents are distributed systems. Follow one Grok Bot message from send to sleep: queues, background workers, durable workflows with Temporal, idempotency, Firecracker VMs, prompt caching, and context compaction."
date: 2026-10-14T06:00:00.000Z
categories: AI
keywords:
  - Grok Bot
  - AI agents
  - always-on agents
  - distributed systems
  - queues
  - background workers
  - durable workflows
  - Temporal
  - idempotency
  - eventual consistency
  - Firecracker
  - prompt caching
  - context compaction
  - Lee Robinson
---

Token maxis at frontier labs have been saying that systems and distributed engineering matter more than ever in the age of AI. I never really understood why until I watched Lee Robinson's talk on how Grok Bot works.

It turns out a modern chat agent isn't some new kind of software paradigm. It's built from the same pieces we've always used to build scalable systems: queues, background workers, durable workflows, idempotency, caching, and eventual consistency. The model is the new part.

Everything that makes the agent useful to a real person is distributed systems work. That includes staying responsive while it works, surviving crashes, and running for hours without burning money.

This post outlines what happens from the moment you press send until the agent goes back to sleep (and tries to point out the familiar patterns along the way). Most of it comes straight from Lee's talk, and I'd strongly recommend watching it. In the places the talk doesn't go into detail, I've filled in the gaps from my own experience with distributed systems.

<p style="padding: 1em 0;">Watch <a href="https://www.youtube.com/watch?v=L1OBRtfPS34">Lee's talk</a>. I created a tool that parsed the entire video, including screenshots, and laid it out in text form: <a href="/transcripts/how-grok-bot-works/">read the full transcript with slides</a>.</p>

## Hitting send

When you press send, the app shows your message right away. It doesn't wait for the server. The app saves the message locally with a unique ID. That ID matters on the server, which drops any message it's already seen. A flaky connection that retries the send won't make you send the same message twice.

That message then joins your conversation's queue.

## The queue, batching, and interrupts

Every conversation has a queue, and anything that wants the agent's attention goes into it. Not every message gets the same treatment, though.

Messages you send directly to Grok Bot interrupt the agent. If it's halfway through a turn and you send something new, it stops and picks up your message. Everything else waits its turn. That includes a finished helper agent reporting back, a Slack mention, or a scheduled workflow firing.

These messages join the queue without interrupting. You get priority because you're the one waiting on the main thread (literally).

If you send three messages really fast, they probably won't become three separate turns. There's probably some sort of short throttling window where messages arriving close together are grouped into one turn.

## Interrupted isn't the same as lost

The main agent loop is a durable workflow running on a server using Temporal. Every model call and tool call is a step, and each step's result is saved as soon as it finishes. The conversation history lives separately in its own database.

**What's Temporal?** An open-source engine that saves the result of every step in your code as it runs. If the server crashes, another one picks up where it left off without redoing the finished work. It also handles retries and lets a workflow sleep until something wakes it up.

Interruptible and durable are easy to confuse, but they're separate properties:

- **Interruptible** means your new message cuts off the turn in progress.
- **Durable** means the work done so far isn't thrown away. The next turn continues from the saved steps.

So you can send your agent a hundred messages and it will keep getting cut off, but it never redoes the work it already finished. The same property keeps it safe from crashes. If a server dies or errors out, the workflow resumes from the last saved step instead of starting over.

## How the server actually runs the loop

Lee mentioned that Grok Bot uses Temporal but didn't go into how the loop runs on it, so this is my best guess.

The servers are always-on worker processes shared by every user. Nothing belonging to you runs between turns.

The loop is ordinary code written once, something like `agentTurn(conversationId)`. When you send a message, the front door saves it and signals Temporal. Temporal creates a task, and any free worker picks it up. That worker loads your conversation history from the database and runs one turn. In that sense, it works a lot like a stateless API request (the one you know and love):

```
workflow agentTurn(conversation):
  messages = loadContext(conversation)   // saved step
  loop:
    reply = callModel(messages)          // saved step
    if no tool calls: break
    for toolCall in reply:
      result = runTool(toolCall)         // saved step
      messages.append(result)
  saveTurn()
  waitForSignal()                        // sleep
```

Temporal acts as both scheduler and record keeper. It hands each step to one worker at a time and records the result. If a worker crashes mid-step, its claim on that step times out, and another worker replays the workflow from the saved steps. This is why every model and tool call writes to the database: those writes are what make replay possible.

When the turn ends, the workflow parks at "wait for a signal." Nothing is held in memory and nothing is running. The workflow is just rows in a database. The agent is reported to sleep after about two idle minutes. I suspect that's the worker keeping things warm in case you reply quickly.

That's how the agent can be "always on" without actually running all the time. The sleep is cheap because none of the state lives on the worker itself.

## Quick work vs. helpers

So your message has reached the agent. What does it do with it?

First, the router at the front door dedupes triggers and puts them in the conversation's queue. After that, the main agent decides for itself how to handle the request using a rule of thumb in its prompt. It acknowledges you, then either does the work itself or hands it off.

Small jobs stay in the main loop. Editing a Notion page or updating a GitHub comment is considered quick, and running it in the background would probably cost more tokens and time than it saves. The main agent can run shell commands too. IIRC the shell runs on the VM, though, so even a quick command will wake the VM. Anything shell-heavy is considered longer-running work and gets sent to a helper.

The downside of doing quick work inline is that your interrupts hit it directly. If you keep sending messages while it's editing that comment, the edit takes longer, because the loop keeps getting cut off. I believe this is how Meta's Muse works too.

For longer work, the agent starts one of four helper types: general, computer use, video, and cloud coding. Each helper is its own durable workflow with its own harness and tools, and it all runs in the background. When a helper finishes, it posts its results to the queue, and that's the non-interrupting message from earlier.

## The VM

The agent loop runs on the shared servers. The VM is separate. It's your agent's own computer, and the loop has a tool to start it when it needs one.

The server is the source of truth. Your conversations, routines, and workflow steps live in a database, like Postgres or SQLite I assume. Your files, memory, and skills are backed up to object storage, like S3 or R2. The VM holds copies of the files it works with, plus its own working files: a downloaded YouTube video, an SEC filing, cloned repos, etc. Those stay until something deletes them, and they're synced to object storage too.

When the VM sleeps, its memory and disk are snapshotted. That means your logged-in sessions and other state survive. It also means the VM is disposable. If the Grok Bot team needs to patch the VM for a zero-day, nothing is lost, because the server holds the source of truth and your files are all backed up.

These are Firecracker microVMs, the same ones AWS Lambda and Fly.io use IIRC. A Firecracker VM is super small and can boot in like 125ms, and restoring from a snapshot is fast too. That means waking up the VM feels instant.

Skills work the same way. Built-in and plugin skills come from the Grok Bot platform itself. Your custom skills are markdown files that live on the VM, the same way you'd store them on your laptop, and they're backed up to object storage. Your memory works the same way, and the agent uses grep to search it.

## Keeping it safe

Similar to ChatGPT's or Claude's auto-review step, Grok Bot has a separate model that reviews the agent's actions before they run, mostly shell commands. It reviews what the agent is about to do, not your prompt.

Content that comes from external sources, like emails and web pages, is always treated as data and never as instructions. Anything that can't be undone, like sending an email or posting to Slack, comes back to you as a draft to approve first (presumably after that dude's bank account details got leaked).

## One tool to talk to you

No matter how the work gets done, the results reach you the same way. There is one global tool called `SendToUser` that Grok Bot uses to contact you. Whether you're on desktop, mobile, or Slack, the agent calls `SendToUser` and each client figures out how to show it to you.

## Context & compaction

An agent that's always available and remembers everything could easily become slow, useless, and expensive. Grok Bot has four different ways to combat that.

### Stable prompt prefix

The model provider caches the prompt from the first token forward. If the start of the prompt, like the system prompt + tool list, is identical on every turn, it's reused cheaply. Anything that changes, like new messages, goes at the end.

That matters more than it sounds. Every turn resends the whole convo, and a cache hit is what makes that fast and affordable. If something near the top changes, everything after it misses the cache, and both cost and latency jump. That's why the team treats cache misses seriously.

I learned this the hard way. You might remember [my X post](https://x.com/peterpme/status/2107847615463219252?s=20) where I estimated that poteto spends $11M a month on AI. I was wrong because I forgot about prompt caching. Once you account for it, the real number is closer to $1M a month. A cached prefix makes a big difference.

This is also how most model providers work btw, not just Grok. Codex and Claude have caching too.

### Lazy-loaded tools and skills

When it comes to your skills, only names and short descriptions sit in the prompt. The full skill only loads when the agent actually needs it. This is how the Agent Skills standard works, and as far as I know, Claude, Codex, and Pi all follow it. It's why a skill's description should say *when* to use it, not what's inside. The description is the only thing the model sees when it decides whether to load the skill. Skills shouldn't load automatically.

If you've ever poked around pstack, you'll see a boolean called `disableModelInvocation`. That stops the model from loading the skill on its own, so you'd have to run it explicitly, like `/hello-world`. Otherwise the model has no idea it's there.

### A small main context

Heavy work goes to the helpers, so the main thread's context stays super small. Let the subagents/helpers pull in what they need for their specific work.

### Context compaction

There are two ways compaction gets triggered. The first runs while you're away. If the context is over 100K tokens and you're gone somewhere between 10 and 60 minutes, the agent compacts in the background. That timing matters because compaction needs to feed the whole conversation back through the model, and doing it while the cache is still warm keeps that cheap.

The second trigger is hitting your context limit. If you stay in one session long enough, the context eventually approaches the window, which is about 200K tokens for Grok Bot (Codex and Claude are like 1M but configurable).

At that point the agent has to compact right away and block the main thread, because it can't defer it. I imagine the chances of this happening are very low for the most part.

In any scenario, your actual conversation history is never deleted. You can scroll back through the whole convo like any iMessage chat. Only the model's working context is compacted.

## How Grok Bot gets better

The system improves in two loops:

- **The inner loop** runs daily. The team finds bugs and fixes the harness, prompt, or inference. They check the changes against some evals and ship them to us.
- **The outer loop** runs every month or few months. They train new models on the failures they've collected.

I imagine there's some form of observability on decisions like whether the agent correctly chose quick work or a helper, and that this feeds directly into the outer loop.

Over time, the model gets trained for the product, and the two improve together. Lessons that used to live in prompts and harnesses get built right into the model itself. This is also why some people say you can throw away your elaborate `AGENTS.md` files and custom skills, because the next model may have been trained to do those things on its own.

Much of what frontier labs like SpaceXSI, OpenAI, and Anthropic build today is really groundwork for the next generation of models.

This is one of the coolest things I learned about how these chat bots work. They are literally trained around the human interaction in chat.

## Lee, if you're reading this

I have more questions, and I'd love to hear from you. Also lmk if I got anything wrong. Here are my questions:

**Servers & Temporal**

- What hosts the agent loop? Are your Temporal workers long-running servers or serverless?
- Is each turn of the main agent its own workflow, or is a whole convo one long-running workflow? I imagine the former.

**Queues & batching**

- How does the queue decide that a burst of messages counts as one batch? Is it a time window?
- When I interrupt a turn, I'm assuming the tool call just gets discarded, like an interrupted server request. Is that right?

**Helpers**

- Is "start a helper" a tool that starts a child workflow and immediately returns an ID?
- When a helper finishes, is that a Temporal signal? Just a queue entry? Or something else?
- Can helpers start helpers of their own?
- Do different helpers run on a different model or with different settings than the main agent?

**The VM**

- I'm assuming I get the same VM every time because of the snapshot. Am I right?
- How long does waking from a snapshot actually take?
- Is there an internal VM manager? How does it pick a host?

**Storage & context**

- I'm assuming compaction replaces the whole context, not just what came after the last summary?
- When the context fills up mid-convo, does it block the main thread and pause the convo? I'd guess new messages get pushed onto the queue but aren't processed until compaction is complete.
