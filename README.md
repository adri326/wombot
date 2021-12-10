# Wombot

An unofficial API and bot for [wombo.art](https://app.wombo.art/).

## Installation

First, clone this repository:

```sh
git clone https://github.com/adri326/wombot/
cd wombot
npm install
```

Then, copy the `secret-template.json` and rename it to `secret.json`, and fill out the required entries for your usage:

- for the CLI interface, you only need to input `identify_key`
- for the bot, you need to provide all of the entries

### CLI

The CLI interface is able to submit one or multiple tasks and download the results for you.

Following is an example querying the API with the prompt "Dark swords and light winds", with style "Dark Fantasy" (10):

```sh
node . "Dark swords and light winds" 10
```

You can find more options and the list of styles by running `node . --help`!

### Bot

Make sure that the CLI interface works (see above section) before running the bot.
Also, please verify the code in this repository and don't blindly give it the token of a discord bot.

To run the bot, run:

```sh
node bot.js
```

## Legal disclaimer

The code in this repository is provided to you AS IS, without any kind of warranty.

I am not liable for whatever you do with it.
[Wombo.ai](https://wombo.ai/) states in their [Terms of Service](https://wombo.ai/terms/) that they own whatever their AIs produce,
so technically, you cannot post anything from them, evening if you got a paid subscription (unless they send you a letter with the rights) or if you're sharing the "trading card" preview (the one with the watermark).

Because uploading the images to discord requires you to give discord the right to reproduce the image on their app, the discord bot shouldn't be used without Wombo's written approval.
