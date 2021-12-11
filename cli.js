const task = require("./index.js");
const styles = require("./styles.js");
const yargs = require("yargs");
const { hideBin } = require('yargs/helpers');

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

(async () => {
    let prompt = argc._[0];
    let style = +argc._[1] || 3;
    if (!quiet) console.log("Prompt: `" + prompt + "`, Style: `" + styles.get(style) + "`");

    if (argc.times > 1) { // --times > 1
        let promises = [];
        let states = [];

        function handler(data, n) {
            let current = data.task?.photo_url_list?.length ?? 0;
            let max = styles.steps.get(style) + 1;
            states[n] = data.state;

            if (!quiet) console.log(n + ": " + data.state + " (" + current + "/" + max + ")");
        }

        for (let n = 0; n < +argc.times; n++) {
            promises.push(task(prompt, style, (data) => handler(data, n), {final, inter}));

            states.push("initializing");
        }

        let res = await Promise.all(promises);
        if (!quiet && final) console.log("Your results have been downloaded to the following files:");
        else if (!quiet) console.log("Task finished, the results are available at the following addresses:");

        for (let r of res) {
            for (let inter of r.inter) {
                console.log(inter);
            }
            if (final) console.log(r.path);
            else console.log(res.url);
        }
    } else { // --times == 1
        function handler(data) {
            switch (data.state) {
                case "authenticated":
                    if (!quiet) console.log("Authenticated, allocating a task...");
                    break;
                case "allocated":
                    if (!quiet) console.log("Allocated, submitting the prompt and style...");
                    break;
                case "submitted":
                    if (!quiet) console.log("Submitted! Waiting on results...");
                    break;
                case "progress":
                    let current = data.task.photo_url_list.length;
                    let max = styles.steps.get(style) + 1;
                    if (!quiet) console.log("Submitted! Waiting on results... (" + current + "/" + max + ")");
                    break;
                case "generated":
                    if (!quiet) console.log("Results are in, downloading the final image...");
                    break;
                case "downloaded":
                    if (!quiet) console.log("Downloaded!");
                    break;
            }
        }

        let res = await task(prompt, style, handler, {final, inter});
        if (!quiet && final) console.log("Your results have been downloaded to the following files:");
        else if (!quiet) console.log("Task finished, the results are available at the following addresses:");

        for (let inter of res.inter) {
            console.log(inter);
        }
        if (final) console.log(res.path);
        else console.log(res.url);
    }
})();
