---
title: Installing Home Assistant on Ubuntu, The New Way
date: 2020-07-31T03:39:01.591Z
---

Have you recently tried installing Home Assistant on a new Ubuntu box? The installation docs are different and the thing that you're looking for is nowhere to be seen. Finally, you find the Docker installation and run the appropriate scripts only to realize the "Supervisor" sidebar went missing.

If you've been scratching your head to figure out what happened, this (slightly salty) article is for you.

## What Happened?

The Home Assistant team recently [decided to deprecate the installations](https://www.home-assistant.io/blog/2020/05/09/deprecating-home-assistant-supervised-on-generic-linux/) for generic Linux machines on May 9th.

For better or for worse, the team doesn't collect any telemetry data and have never heard of simple community polls so surprise, surprise a week later they [decide to undo that decision](https://www.home-assistant.io/blog/2020/05/26/installation-methods-and-community-guides-wiki/) (after what must have been a stressful series of "wtfs" in the community).


## I Still Love Home Assistant

As frustrating as this is, it's hard to get upset at a group of folks who work so hard to release this amazing tool, in the open, for free. I'm sure they've learned a lot when it comes to managing an open source project and managing a business.

## The New Problem

Supervisor is actually completely separate than Home Assistant. Who knew!? Nobody.

I'm sure, like me you spent the afternoon Googling wondering why "Supervisor" doesn't show up (the thing with all the add-ons) when you went through the [installation docs](https://www.home-assistant.io/docs/installation/docker/).

The funny thing about all this is that Home Assistant still offically supports Debian but who the fk uses Debian!?

## Getting started

Home Assistant's top [post](https://community.home-assistant.io/t/installing-home-assistant-supervised-on-ubuntu-18-04-4/200020) on their forums is Installing on Ubuntu. They no longer "officially support" Ubuntu but "support it in other ways".

The process is pretty straight forward. The difference is that this awesome person Jason (Kanga-Who) forked the script and has been maintaining it. The reality of it is there isn't really that much maintenance to be done. Once you have this running you'll be able to use and upgrade Home Assistant the same way you've always been able to!

I won't walk you through the process of setting up a USB stick to install Ubuntu. You can read about that [here](https://community.home-assistant.io/t/installing-home-assistant-supervised-on-ubuntu-18-04-4/200020)

```sh
sudo -i

apt-get install -y software-properties-common apparmor-utils apt-transport-https avahi-daemon ca-certificates curl dbus jq network-manager socat

systemctl disable ModemManager

systemctl stop ModemManager

curl -fsSL get.docker.com | sh

curl -sL "https://raw.githubusercontent.com/Kanga-Who/home-assistant/master/supervised-installer.sh" | bash -s
```

## Config folder path

Protected more closely than Ft. Knox, the config path on the installation instructions has always been hard to find. Using this installation step, it's located here:

```
/usr/share/hassio/homeassistant
```

Yes, its easy to lose it when all you see is `YOUR_CONFIG_PATH_HERE:/config` with literally 0 clues on where it should go or where it lives.

The backup/snapshot directory on the other hand is located here:

```
/usr/share/hassio/backup
```

## Exposing USB Devices

In my experience all my devices started showing up properly and there was nothing else I needed to do! If you follow this same installation method, you'll totally be in the clear.
