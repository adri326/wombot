# Wombot

An unofficial API and discord bot for [wombo.art](https://app.wombo.art/), aka Wombo Dream.
It lets you queue and download the final and intermediary images of the AI, bypassing the limitations of the official webpage.

## Projects using this library

Here are links towards other (cool) projects that make use of this library:

- [Datasets and Pretrained models for StyleGAN3](https://github.com/edstoica/lucid_stylegan3_datasets_models/blob/main/README.md), based on Wombo Dream. This project uses the output of Wombo Dream to train models and generate new images for a chosen theme.
- [Wombot Collager](https://github.com/ElliotRoe/wombot), an extension of this library to generate collages of many of Wombo Dream's outputs.

## Installation

First, clone this repository and install the required dependencies:

```sh
git clone https://github.com/adri326/wombot/
cd wombot
npm install
```

If you wish to run the discord bot, then copy the file named `secret-template.json` to `secret.json` and fill in the required fields in it.

### CLI

The CLI interface is able to submit one or multiple tasks and download the results for you.

Following is an example querying the API with the prompt "Dark swords and light winds", with style "Dark Fantasy" (10):

```sh
node cli.js "Dark swords and light winds" 10
```

You can find more options and the list of styles by running `node cli.js --help`!

### Bot

Make sure that the CLI interface works (see above section) before running the bot.
Also, please verify the code in this repository and don't blindly give it the token of a discord bot.

To start the bot, you can run:

```sh
node bot.js
```

## Node.js module

If you wish to use this API using a node.js module, then you should import this repository using `npm` or `yarn`:

```sh
npm install --save adri326/wombot
```

Then, in your code, import this library:

```js
const wombot = require("wombot");

wombot("Your prompt", 10, (data) => {
    // Callback for intermediary results, useful for debugging
    console.log(data.status);
}, {
    final: true, // Download the final image
    inter: false, // Download the intermediary results,
    download_dir: "./generated/", // Where to download images
}).then(data => {
    console.log(data.path); // Path of the downloaded file
}).catch(err => {
    console.error(err);
});
```

## Disclaimer

The code in this repository is provided to you AS IS, without any kind of warranty.
I am not a lawyer, so take the following section as my opinion and not legal advice:

This script only reproduces the sequence of requests made by the website and downloads data already downloaded by the website and shown to the user, albeit only temporarily.
One could open the Developer Tools on the official website and download the same version there.
