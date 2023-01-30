---
title: Adding Spotify to Home Assistant
date: 2020-03-02T06:00:00.000Z
categories: Home Assistant
---

Home Assistant recently changed the way Spotify's configured so I wrote up a guide. This works with most versions of HomeAssistant but I used it with 106 & up.

# Steps

- Login to the **[Spotify Developers Console](https://developer.spotify.com/dashboard)** with your Spotify username and password.
- Click **Create a Client ID** in the top right corner. A popup should appear.
- Enter **Home Assistant (or whatever)** for the app name. Description doesn't matter. Put "Automation" in the description. A new pop up appears.
- Click the **Non Commercial** button on the right hand side.
- Checkmark **Website** and then press Next. Next popup.
- Click **all 3 checkboxes** and then click **Submit.**
- You'll see a new page with your newly created app.
- In the top right corner, click the green button that says **Edit Settings.** A popup appears. We need to add **Redirect URI's** and nothing else.
- Create two redirect URIs. One that goes to your lovelace UI and the other to the appropriate URL. **Even if you have Nabu Casa or DuckDNS set up, just use your local http:// URL.
    - http://192.168.0.1:8123/lovelace/lovelace_default_view
    - http://192.168.0.1:8123/auth/external/callback
- Click **Show Client Secret.** Open up **Configuration.yaml** and paste the keys directly or use secrets.yaml (like I have below)
- Create a `spotify` key in your `configuration.yaml` file as shown below. I use the [secrets.yaml](https://www.home-assistant.io/docs/configuration/secrets/) file which is why you see `!secret`.

```yaml
spotify:
  client_id: !secret spotify_id (OR "clientidxyz")
  client_secret: !secret spotify_secret (OR "clientsecretxyz")
```

- Restart Home Assistant by going to **Configuration** and clicking **Server Controls,** then **Restart**.
- You'll see a new notification in the bottom left corner for **New Devices Discovered.** Click **Check it out,** then click **Configure** under Spotify. Everything should happen automatically.
- Once that pos up, you should see a pop up that says Success. Just click **Finish.**
- If you have any other Spotify integrations, just click **Ignore.**
- **You're Done!**

# Add Spotify to your Lovelace Dashboard

If you want to add Spotify to your LoveLace Dashboard. Click Spotify under **Configured**, then click it again.

You'll now see a page with Automations, Scenes, etc. Just click **Add To LoveLace at the top.** **This seems to be broken in 106, but if you check your dashboard it might just show up so who knows!
