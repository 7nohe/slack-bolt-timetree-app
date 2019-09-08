# Slack Bolt TimeTree App

- Node.js v10.15.0 or higher

## Run locally

Run Bolt app

```
$ export TIMETREE_PERSONAL_TOKEN=XXXXXXXXXXXXX
$ export SLACK_SIGNING_SECRET=XXXXXXXXXXXXX
$ export SLACK_BOT_TOKEN=XXXXXXXXXXXXX
$ npm install
$ npm run start
```

Run [ngrok](https://ngrok.com/) to publish globally

```
$ ngrok http 3000
```

App Endpoint: http://xxxxxxx/slack/events/

## Slack Setup

Visit [Slack API - Your Apps](https://api.slack.com/apps/)

1. Click [Create New App] to create a new app

2. SLACK_SIGNING_SECRET: [Basic Information] -> [App Credentials] -> [Signing Secret]

3. In [Bot Users], add a new bot

4. SLACK_BOT_TOKEN: [Install Apps] -> [Bot User OAuth Access Token]

5. [Slash Commands] -> [Create New Command] ([Request URL] should be like "http://xxxxxxx/slack/events/")


## Deploy to Google App Engine

```
$ cp secret.example.yaml secret.yaml
$ gcloud app deploy
```
