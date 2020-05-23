---
title: Installing & Securing dd-wrt
date: 2020-05-01T05:00:00.000Z
---


[http://192.168.1.1/](http://192.168.1.1/)

- Change Password

## Setup Tab

Assume if a field isn't listed, you don't have to change it!

### Optional Settings

- Router Name
    - Change to whatever you'd like

![./Untitled.png](./Untitled.png)

### Router IP

- Local IP Address: Change this! This'll help prevent malware from spreading:
    - 192.168.7.4 or 192.168.3.6 - just don't keep it the default 192.168.1.1

    ![./Screen_Shot_2020-04-24_at_11.15.12_AM.png](./Screen_Shot_2020-04-24_at_11.15.12_AM.png)

### Network Settings

- Make sure DNSMasq for DNS and DHCP-Authoritive are checked

![./Untitled%201.png](./Untitled%201.png)

### Time Settings

- Time zone - check the right timezone

**Click Save, then Apply Settings**

- Open up your computer's Network Settings (System Prefs → Network)
- Ethernet / WiFi click "Advanced"
- Click RENEW DHCP Lease
- You can also toggle your WiFI on/off or unplug your ethernet cable back in

Go back to 

# Basic Wireless Settings

![./Untitled%202.png](./Untitled%202.png)

## Wireless Security

![./Screen_Shot_2020-04-24_at_11.33.02_AM.png](./Screen_Shot_2020-04-24_at_11.33.02_AM.png)

## Security

** I have WAN requests ping enabled for line quality tests on dsl reports

![./Untitled%203.png](./Untitled%203.png)

## Adminstration Keep Alive

![./Untitled%204.png](./Untitled%204.png)

![./Untitled%205.png](./Untitled%205.png)

![./Untitled%206.png](./Untitled%206.png)

```sh
dhcp-option=6,192.168.6.142
domain-needed
bogus-priv
no-resolv
server=192.168.6.142
expand-hosts
```

## Resources

- [ftp://ftp.dd-wrt.com/betas/2020/](ftp://ftp.dd-wrt.com/betas/2020/)
- [https://wiki.dd-wrt.com/wiki/index.php/Installation](https://wiki.dd-wrt.com/wiki/index.php/Installation)
- [https://dfarq.homeip.net/recommended-dd-wrt-settings/](https://dfarq.homeip.net/recommended-dd-wrt-settings/)
- [https://wiki.dd-wrt.com/wiki/index.php/Basic_Wireless_Settings](https://wiki.dd-wrt.com/wiki/index.php/Basic_Wireless_Settings)
- [https://www.reddit.com/r/DestinyTheGame/comments/5zxaw0/reduce_lag_in_pvpimprove_your_connection_indepth/](https://www.reddit.com/r/DestinyTheGame/comments/5zxaw0/reduce_lag_in_pvpimprove_your_connection_indepth/)
- [https://www.reddit.com/r/pihole/comments/er1opk/pihole_ddwrt_dns_redirection_issues/](https://www.reddit.com/r/pihole/comments/er1opk/pihole_ddwrt_dns_redirection_issues/)

archer c9 v1 [ftp://ftp.dd-wrt.com/betas/2020/04-15-2020-r42910/tplink_archer-c9v1/](ftp://ftp.dd-wrt.com/betas/2020/04-15-2020-r42910/tplink_archer-c9v1/)
