# Wombot

An unofficial API and bot for [wombo.art](https://app.wombo.art/).

## Installation

First, clone this repository:

```sh
git clone https://github.com/adri326/wombot/
cd wombot
npm install
```

Then, copy the `secret-template.json` and rename it to `secret.json`, and fill out the required entries.

Finally, you can start the bot with:

```sh
node bot.js
```

Or, simply run it once with:

```sh
node . "Your prompt" STYLE_ID
# Make sure to replace STYLE_ID with a number between 1 and 13
```

## Legal disclaimer

The code in this repository is provided to you AS IS, without any kind of warranty.

I am not liable for whatever you do with it.
[Wombo.ai](https://wombo.ai/) states in their [Terms of Service](https://wombo.ai/terms/) that they own whatever their AIs produce,
so technically, you cannot post anything from them, evening if you got a paid subscription (unless they send you a letter with the rights) or if you're sharing the "trading card" preview (the one with the watermark).

Because uploading the images to discord requires you to give discord the right to reproduce the image on their app, the discord bot shouldn't be used without Wombo's written approval.
