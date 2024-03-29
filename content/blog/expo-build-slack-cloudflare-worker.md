---
title: Simple Script for Expo's Eas Build Notifications in Slack
description: >-
  Expo doesn't currently have a way to send updates when a build succeeds or fails. I created this simple script for Cloudflare Workers.
date: 2023-02-09T20:11:04.724Z
categories: [expo, cloudflare workers, eas]
---

Expo doesn't currently have a way to send Slack updates when a build succeeds or fails. If you're open to using [Cloudflare workers](https://workers.cloudflare.com) then you're in luck!

That being said, if you'd like to use this on any other service, that's easy too! The most important part is the `handleExpoStatus` code block.
This is just a plain javascript object that creates the right Slack message body for the webhook.

Note: Expo recommends you check that the endpoint is correctly secured so you can't call it outside of your organizations context.
I'm not using the `SECRET_WEBHOOK_KEY` in this example. According to [Expo's docs](https://docs.expo.dev/eas/webhooks/#webhook-server),
you should be checking against a `SECRET_WEBHOOK_KEY` variable.

If your URL isn't public, then you should be ok. I added a dumb check to make sure the object includes my team's metadata.
That being said, if somebody discovers this URL, you'll quickly wake up to spam and change it :)

```js
// replace this
const SLACK_WEBHOOK_URL = "https://hooks.slack.com/services/XXX/YYY/ZZZZ"

async function sendSlackRequest({ text, blocks }) {
  const postToSlack = await fetch(SLACK_WEBHOOK_URL, {
    body: JSON.stringify({ text, blocks }),
    method: "POST",
    headers: { "Content-Type": "application/json" },
  })
}

export default {
  async fetch(request, env) {
    if (request.method === "POST") {
      const body = await request.json()

      // dumb check to make sure the endpoint is correct
      if (body.accountName !== "My Team") {
        return new Response("heh")
      }

      const slackPayload = handleExpoStatus(body)
      await sendSlackRequest(slackPayload)
      return new Response("ok")
    } else {
      return new Response("ok")
    }
  },
}

function handleExpoStatus(body) {
  if (body.platform === "ios" && body.status === "finished") {
    const url = `itms-services://?action=download-manifest;url=https://exp.host/--/api/v2/projects/${body.appId}/builds/${body.id}/manifest.plist`

    return {
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: ":apple-logo: Build completed successfully for iOS :ship_it_parrot:",
            emoji: true,
          },
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Build Profile*: ${body.metadata.buildProfile}\n*Version:* ${body.metadata.appVersion}\n*Build*: ${body.metadata.appBuildVersion}`,
            },
          ],
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "Download IPA",
              },
              url: body.artifacts.buildUrl,
            },
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "Open Build Details Page",
              },
              url: body.buildDetailsPageUrl,
            },
          ],
        },
        {
          type: "image",
          image_url: `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
            url
          )}&size=250x250&qzone=2`,
          alt_text: "qr",
        },
      ],
    }
  }

  if (body.platform === "android" && body.status === "finished") {
    return {
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: ":android-logo: Build completed successfully for Android :ship_it_parrot:",
            emoji: true,
          },
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Build Profile*: ${body.metadata.buildProfile}\n*Version:* ${body.metadata.appVersion}\n*Build*: ${body.metadata.appBuildVersion}`,
            },
          ],
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "Download APK",
              },
              url: body.artifacts.buildUrl,
            },
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "Open Build Details Page",
              },
              url: body.buildDetailsPageUrl,
            },
          ],
        },
        {
          type: "image",
          image_url: `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
            body.artifacts.buildUrl
          )}&size=250x250&qzone=2`,
          alt_text: "qr",
        },
      ],
    }
  }

  if (body.platform === "ios" && body.status === "errored") {
    return {
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: ":apple-logo: Build failed for iOS :sob:",
            emoji: true,
          },
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Build Profile*: ${body.metadata.buildProfile}\n*Version:* ${body.metadata.appVersion}\n*Build*: ${body.metadata.appBuildVersion}`,
            },
          ],
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "Open Build Details Page",
              },
              url: body.buildDetailsPageUrl,
            },
          ],
        },
      ],
    }
  }

  if (body.platform === "android" && body.status === "errored") {
    return {
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: ":android-logo: Build failed for Android :sob:",
            emoji: true,
          },
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Build Profile*: ${body.metadata.buildProfile}\n*Version:* ${body.metadata.appVersion}\n*Build*: N/A`,
            },
          ],
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "Open Build Details Page",
              },
              url: body.buildDetailsPageUrl,
            },
          ],
        },
      ],
    }
  }
}
```
