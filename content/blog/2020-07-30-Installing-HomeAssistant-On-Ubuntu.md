---
title: Installing Home Assistant on Ubuntu 20.04
date: 2020-07-31T03:39:01.591Z
---

Did you recently install Home Assistant on a new Ubuntu box and realize the "Supervisor" sidebar is missing? This salty article is for you.

Home Assistant recently deprecated all of their non raspberry pi install shit and maybe literally a day later realized that they didn't have any analytics and non-raspberry pi installations like on Ubuntu and Debian were really popular.

The Home Assistant team crushes it so even though I'm shitting on them a little I absolutely respect the community they've been able to build.

## The Problem

I'm sure, like me you spent the afternoon Googling wondering why "Supervisor" doesn't show up (the thing with all the add-ons) when you went through the [installation docs](https://www.home-assistant.io/docs/installation/docker/).

Supervisor is actually completely separate than Home Assistant. Who knew! Nobody.

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

You're probably wondering how you can expose those devices. This is a little complex. You'd think that this post should have all the answers but folks have cried to keep USB devices and installation separate so you'll immediately have to start googling after successfully getting this working (which is how you found this article!)

Here's a [post](https://community.home-assistant.io/t/installing-home-assistant-supervised-on-ubuntu-18-04-4/200020/55) that walks you through it. To be honest I'm not there yet but expect an update to this post soon!

