const task = require("./task.js");
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
(async () => {
    let prompt = argc._[0];
    let style = +argc._[1] || 3;
    console.log("Prompt: `" + prompt + "`, Style: `" + styles.get(style) + "`");
    if (argc.times > 1) {
        let promises = [];
        let states = [];
        function handler(data, n) {
            let current = data.task?.photo_url_list?.length ?? 0;
            let max = styles.steps.get(style) + 1;
            console.log(n + ": " + data.state + " (" + current + "/" + max + ")");
        }
        for (let n = 0; n < +argc.times; n++) {
            promises.push(task(prompt, style, (data) => handler(data, n)));
            states.push("initializing");
        }
        let res = await Promise.all(promises);
        console.log("Your results are available at:");
        for (let r of res) {
            console.log(r.path);
        }
    } else {
        let res = await task(prompt, style, (data) => {
            switch (data.state) {
                case "authenticated":
                    console.log("Authenticated, allocating a task...");
                    break;
                case "allocated":
                    console.log("Allocated, submitting the prompt and style...");
                    break;
                case "submitted":
                    console.log("Submitted! Waiting on results...");
                    break;
                case "progress":
                    let current = data.task.photo_url_list.length;
                    let max = styles.steps.get(style) + 1;
                    console.log("Submitted! Waiting on results... (" + current + "/" + max + ")");
                    break;
                case "generated":
                    console.log("Results are in, downloading the final image...");
                    break;
                case "downloaded":
                    console.log("Downloaded!");
                    break;
            }
        });
        console.log("Your file is available at:");
        console.log(res.path);
    }
})();
