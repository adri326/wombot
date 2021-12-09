const Rest = require("./rest.js");
const identify = require("./identify.js");
const download = require("./download.js");
const mkdirp = require("mkdirp");

mkdirp("./generated/");

let paint_rest = new Rest("paint.api.wombo.ai");

module.exports = async function task(prompt, style, update_fn = () => {}) {
    let id = await identify();

    paint_rest.custom_headers = {
        "Authorization": "bearer " + id,
        "Origin": "https://app.wombo.art",
        "Referer": "https://app.wombo.art/",
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:95.0) Gecko/20100101 Firefox/95.0",
    };

    update_fn({
        state: "authenticated",
        id,
    });

    let task = await paint_rest.options("/api/tasks/", "POST")
        .then(() => paint_rest.post("/api/tasks/", {premium: false}));

    let task_path = "/api/tasks/" + task.id;

    update_fn({
        state: "allocated",
        id,
        task,
    });

    task = await paint_rest.options(task_path, "PUT")
        .then(() => paint_rest.put(task_path, {
            input_spec: {
                display_freq: 10,
                prompt,
                style: +style,
            }
        }));

    update_fn({
        state: "submitted",
        id,
        task,
    });

    while (!task.result) {
        task = await paint_rest.get(task_path, "GET");
        if (task.state === "pending") console.warn("Warning: task is pending");
        update_fn({
            state: "progress",
            id,
            task,
        });
        await (new Promise((res) => setTimeout(res, 1000)));
    }

    update_fn({
        state: "generated",
        id,
        task,
        url: task.result.final
    });

    let download_path = "./generated/" + task.id + ".jpg";

    await download(task.result.final, download_path);

    update_fn({
        state: "downloaded",
        id,
        task,
        url: task.result.final,
        path: download_path,
    });

    return {
        state: "downloaded",
        id,
        task,
        url: task.result.final,
        path: download_path,
    };
}
