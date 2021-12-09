const Rest = require("./rest.js");
const identify = require("./identify.js");
const download = require("./download.js");
const mkdirp = require("mkdirp");

mkdirp("./generated/");

let paint_rest = new Rest("paint.api.wombo.ai", 100);

module.exports = async function task(prompt, style, update_fn = () => {}) {
    let id;
    try {
        id = await identify();
    } catch (err) {
        console.error(err);
        throw new Error(`Error while sending prompt:\n${err.toFriendly ? err.toFriendly() : err.toString()}`);
    }

    paint_rest.custom_headers = {
        "Authorization": "bearer " + id,
        "Origin": "https://app.wombo.art",
        "Referer": "https://app.wombo.art/",
    };

    update_fn({
        state: "authenticated",
        id,
    });

    let task;
    try {
        task = await paint_rest.options("/api/tasks/", "POST")
            .then(() => paint_rest.post("/api/tasks/", {premium: false}));
    } catch (err) {
        console.error(err);
        throw new Error(`Error while allocating a new task:\n${err.toFriendly ? err.toFriendly() : err.toString()}`);
    }

    let task_path = "/api/tasks/" + task.id;

    update_fn({
        state: "allocated",
        id,
        task,
    });

    try {
        task = await paint_rest.options(task_path, "PUT")
            .then(() => paint_rest.put(task_path, {
                input_spec: {
                    display_freq: 10,
                    prompt,
                    style: +style,
                }
            }));
    } catch (err) {
        console.error(err);
        throw new Error(`Error while sending prompt:\n${err.toFriendly ? err.toFriendly() : err.toString()}`);
    }

    update_fn({
        state: "submitted",
        id,
        task,
    });

    while (!task.result) {
        try {
            task = await paint_rest.get(task_path, "GET");
        } catch (err) {
            console.error(err);
            throw new Error(`Error while fetching update:\n${err.toFriendly ? err.toFriendly() : err.toString()}`);
        }
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

    try {
        await download(task.result.final, download_path);
    } catch (err) {
        console.error(err);
        throw new Error(`Error while downloading results:\n${err.toFriendly ? err.toFriendly() : err.toString()}`);
    }

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
