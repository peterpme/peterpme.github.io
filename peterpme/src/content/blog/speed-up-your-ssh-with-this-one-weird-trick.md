---
title: Speeding up Git with SSH Config
date: 2016-11-11T17:09:37.633Z
categories: [Developer Tools]
---

I’ve been snooping around [Paul Irish](https://medium.com/u/6d5456230083)’s dotfiles and discovered this gem.
I instantly noticed the difference and absolutely needed to share this with the rest of the world!

```sh
# copy to ~/.ssh/config

Host github.com
	ControlMaster auto
	ControlPersist 120

Host *
	# Always use SSH2.
	Protocol 2

	# Use a shared channel for all sessions to the same host,
	# instead of always opening a new one. This leads to much
	# quicker connection times.
	ControlMaster auto
	ControlPath ~/.ssh/control/%r@%h:%p
	ControlPersist 1800

	# also this stuff
	Compression yes
	TCPKeepAlive yes
	ServerAliveInterval 20
	ServerAliveCountMax 10
```

[Learn more by watching this video on SSH](https://serversforhackers.com/video/using-the-ssh-config-file "https://serversforhackers.com/video/using-the-ssh-config-file")

