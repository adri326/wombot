#!/bin/node
const task = require("./index.js");
const styles = require("./styles.js");
const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");

const argc = yargs(hideBin(process.argv))
    .scriptName("wombot")
    .usage(
        "\"$0 <prompt> [style] [--times N]\"; where \"style\" can be a number between 1 and 12 (default 3):\n"
        + [...styles].map(([id, name]) => id + " -> " + name).join("\n")
    )
    .positional("prompt", {
        type: "string",
        describe: "The prompt used by the AI to generate an image"
    })
    .positional("style", {
        type: "number",
        default: 3,
        describe: "The style of the AI: chooses a collection of (presumed) GANs chained together, yielding different \"styles\""
    })
    .option("times", {
        type: "number",
        default: 1,
        describe: "The number of times to request an image; setting this to a number higher than 10 will cause issues with the built-in ratelimiter!"
    })
    .option("quiet", {
        type: "boolean",
        default: false,
        describe: "Silences most of the output, only printing the paths of the downloaded files.",
    })
    .option("inter", {
        type: "boolean",
        default: false,
        describe: "When set, downloads the intermediary results as well."
    })
    .option("nofinal", {
        type: "boolean",
        default: false,
        describe: "When set, disables the download of the final image. Instead, its url is printed."
    })
    .option("noasync", {
        type: "boolean",
        default: false,
        describe: "When set, disables the asyncronous generation. May avoid rate limiting.",
    })
    .alias("h", "help")
    .parse();

if (!styles.has(+argc._[1])) {
    console.error("Invalid style: expected a number between 1 and 12!");
    console.log("INFO: the available styles are:");
    for (let [id, name] of styles) {
        console.log(id + " -> " + name);
    }
    return;
}

const quiet = argc.quiet;
const inter = argc.inter;
const final = !argc.nofinal;

async function generate(prompt, style, prefix) {
    function handler(data, prefix) {
        switch (data.state) {
            case "authenticated":
                if (!quiet) console.log(`${prefix}Authenticated, allocating a task...`);
                break;
            case "allocated":
                if (!quiet) console.log(`${prefix}Allocated, submitting the prompt and style...`);
                break;
            case "submitted":
                if (!quiet) console.log(`${prefix}Submitted! Waiting on results...`);
                break;
            case "progress":
                let current = data.task.photo_url_list.length;
                let max = styles.steps.get(style) + 1;
                if (!max){
                    max=20;
                }
                if (!quiet) console.log(`${prefix}Submitted! Waiting on results... (${current}/${max})`);
                break;
            case "generated":
                if (!quiet) console.log(`${prefix}Results are in, downloading the final image...`);
                break;
            case "downloaded":
                if (!quiet) console.log(`${prefix}Downloaded!`);
                break;
        }
    }

    let res = await task(prompt, style, (data) => handler(data, prefix), {final, inter});
    if (!quiet && final)
        console.log(`${prefix}Your results have been downloaded to the following files:`);
    else if (!quiet)
        console.log(`${prefix}Task finished, the results are available at the following addresses:`);

    for (let inter of res.inter)
        console.log(inter);

    if (final) console.log(res.path);
    else console.log(res.url);
}

(async () => {
    let prompt = argc._[0];
    let style = +argc._[1] || 3;
    if (!quiet)
        console.log(`Prompt: \`${prompt}\`, Style: \`${styles.get(style)}\``);

    for (let n = 0; n < +argc.times; n++) {
        const prefix = argc.times == 1 ? `` : `${n+1}: `;
        if (argc.noasync) await generate(prompt, style, prefix);
        else generate(prompt, style, prefix);
    }
})();
