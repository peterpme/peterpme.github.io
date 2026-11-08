---
title: "AI agents can see my inbox. Here's what I locked down."
description: "Agents with access to your mail, files and accounts change the threat model. Here's what I actually do, and a checklist for the rest."
date: 2026-11-05T06:00:00.000Z
categories: AI
draft: true
---

I give AI agents access to my inbox, my files and some of my accounts.

That used to be a non-starter. Now I do it on purpose. Useful. Also a different threat model than "don't click weird links."

If something can read your inbox, it can see password resets, bank alerts and the mess of personal life that ends up in email. So I locked down the boring stuff around the agents before I handed them more.

## What I actually do

None of this is exotic.

My Mac [locks after two minutes](https://support.apple.com/guide/mac-help/change-lock-screen-settings-on-mac-mh11784/mac) of inactivity. Short enough that a laptop left open doesn't stay signed in.

Work and home don't share a network. IoT devices sit on their own locked-down segment. Cameras and plugs don't belong on the same LAN as a laptop that can reach work email.

I scrub old email with filters. Less leftover mail means less for an agent (or anyone else) to trip over.

Financially important mail goes to separate accounts. The account that gets shopping noise is not the account that gets bank alerts. If one gets noisy, or compromised, the other still works.

My domains get extra security at the registrar. Domains are how people take over email. Extra lock, extra verification, no casual transfers.

Home projects run through [Tailscale](https://tailscale.com/docs/features/tailscale-ssh). I have an always-on OptiPlex at home. I reach it over Tailscale SSH. No open SSH on the public internet. The machine is there when I need it, and nowhere when I don't.

That's the floor. Agents sit on top of it.

## Scope the agents

Before you connect an AI tool to Gmail, Drive or Slack, read the permissions screen. Grant the minimum. Prefer read-only when the product offers it. Revoke anything you aren't using.

Most consumer AI products let you opt out of training. Do it.

- [ChatGPT data controls](https://help.openai.com/en/articles/7730893-data-controls-in-chatgpt): turn off "Improve the model for everyone."
- [Claude privacy settings](https://privacy.claude.com/en/articles/12109829-how-do-i-change-my-model-improvement-privacy-settings): turn off model improvement.
- [Gemini Apps activity](https://support.google.com/gemini/answer/13278892): turn off Keep Activity if you don't want chats stored and used that way.

And once a year, walk your [Google third-party connections](https://support.google.com/accounts/answer/13533235) (and the Apple and Microsoft equivalents) and kill anything stale. OAuth grants accumulate quietly. Treat them like house keys you forgot to collect.

Keep API keys out of chats and scripts you paste into agents. If a key has to exist, put it in an environment variable or a secrets manager, not in a prompt. Agents remember more than you think, and logs last longer than the chat window.

## Passkeys, passwords, hardware keys

Use a password manager. Turn on [passkeys](https://support.apple.com/en-us/102195) where the site supports them ([Google's guide](https://support.google.com/accounts/answer/13548313) is solid too). Passkeys don't phish the way passwords do.

For email, your bank and your domain registrar, add a [hardware security key](https://support.apple.com/en-us/102637). Google has a [security key guide](https://support.google.com/accounts/answer/6103523) as well. Those three accounts are the ones that unlock everything else. Treat them that way.

## Your phone number is a skeleton key

SMS two-factor is better than nothing and worse than almost every alternative. If someone ports your number, they can intercept codes.

Set a port-out PIN with your carrier. Verizon, AT&T and T-Mobile all document it:

- [Verizon number transfer PIN](https://www.verizon.com/support/port-out-faqs/)
- [AT&T transfer PIN](https://www.att.com/support/article/wireless/KM1447526/)
- [T-Mobile transfer PIN](https://www.t-mobile.com/support/account/transfer-your-phone-number)

Then move important accounts off SMS 2FA onto an authenticator app, a passkey or a hardware key.

## A family code word

The FBI's Internet Crime Complaint Center has a [public advisory](https://www.ic3.gov/PSA/2024/PSA241203) on generative AI fraud. One of their tips: create a secret word or phrase with your family to verify identity. Voice cloning only needs a short clip. A code word still needs the actual person.

I have a newborn. That makes the "family emergency" call shape feel less abstract than it used to. I'm not claiming I've set a code word up. I'm saying it's worth doing before you need it. Pick a word. Tell the people who would get that call. Don't post it anywhere.

## Freezes, brokers, masks

Freeze your credit at all three bureaus. It's free, it doesn't hurt your score, and it stops most new-account fraud cold. [USA.gov](https://www.usa.gov/credit-freeze) and the [CFPB](https://www.consumerfinance.gov/ask-cfpb/what-is-a-credit-freeze-or-security-freeze-on-your-credit-report-en-1341/) both walk through it.

Opt out of data brokers when you can. If you're a California resident, the state's [DROP](https://privacy.ca.gov/drop) tool sends one deletion request to hundreds of registered brokers. Elsewhere, it's still worth hitting the big people-search sites one by one.

Use masked emails for signups. Apple's [Hide My Email](https://support.apple.com/guide/icloud/set-up-hide-my-email-mm9d9012c9e8/icloud) is fine. Same idea for cards: virtual card numbers from your bank or card issuer, one per merchant when you can. When a store leaks, you cancel one number, not the whole card.

## Photos leak where you live

Phones embed location in photos by default. Strip it before you share photos taken at home. Apple documents how to [manage location metadata in Photos](https://support.apple.com/guide/personal-safety/manage-location-metadata-in-photos-ips0d7a5df82/web). Turn location off for the Camera app if you don't need it.

## The point

I want agents that can read my mail and still not be able to ruin my week.

So the agents stay narrow. The Mac locks fast. The networks are split. The important mail is separated. The home server isn't on the public internet. And the checklist above is what I'd tell a friend to do before they connect anything new.

Security here isn't a product. It's a pile of small defaults that make the useful, slightly scary thing safe enough to keep using.
