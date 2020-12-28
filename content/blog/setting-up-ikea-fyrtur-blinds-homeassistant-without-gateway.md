---
title: Setting up Ikea Fyrtur Blinds in HomeAssistant without a Gateway
date: 2020-11-27T16:06:23.990Z
---

Setting up IKEA's Fyrtur blinds with Home Assistant is easy. No gateway required.

My blinds were previously controlled with the remote control and repeater, aka a "working state". I was able to switch over to Home Assistant just fine, without having to reset anything.

## Steps

- Make sure to charge your blind battery to 100%. This helps with pairing.
- Press and hold the top and bottom buttons on the blinds for a couple seconds until they start breathing/flashing.
- Go over to your Zigbee setup in Home Assistant and press "Add Device".

In about a couple seconds you should have a green box pop up that says "Pairing Successful". You no longer need to use the repeater. The remote will not work anymore either.

That being said, you could probably find a way to connect the remote directly to Home Assistant but I haven't done that.

I've noticed that `cover.set_position` works much better than `open` and `close`. This is running version `2020.12.7`. Maybe it'll be fixed by the time you're reading this.
