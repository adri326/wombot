const Rest = require("./rest.js");
const identify = require("./identify.js");
const download = require("./download.js");
const mkdirp = require("mkdirp");
const path = require("path");

let paint_rest = new Rest("paint.api.wombo.ai", 100);

module.exports = async function task(prompt, style, update_fn = () => {}, settings = {}) {
    let {final = true, inter = false, identify_key, download_dir = "./generated/"} = settings;
    if (final || inter) mkdirp(download_dir);

    let id;
    try {
        id = await identify(identify_key);
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

    let inter_downloads = [];
    let inter_paths = [];
    let inter_finished = [];

    while (!task.result) {
        try {
            task = await paint_rest.get(task_path, "GET");
        } catch (err) {
            console.error(err);
            throw new Error(`Error while fetching update:\n${err.toFriendly ? err.toFriendly() : err.toString()}`);
        }
        if (task.state === "pending") console.warn("Warning: task is pending");

        if (inter) {
            for (let n = 0; n < task.photo_url_list.length; n++) {
                if (inter_downloads[n] || /\/final\.je?pg/i.exec(task.photo_url_list[n])) continue;
                inter_paths[n] = path.join(download_dir, `${task.id}-${n}.jpg`);

                inter_downloads[n] = download(task.photo_url_list[n], inter_paths[n]).then(() => {
                    return inter_finished[n] = inter_paths[n];
                });
            }
        }

        update_fn({
            state: "progress",
            id,
            task,
            inter: inter_finished
        });
        await (new Promise((res) => setTimeout(res, 1000)));
    }

    update_fn({
        state: "generated",
        id,
        task,
        url: task.result.final,
        inter: inter_finished,
    });

    let download_path = path.join(download_dir, `${task.id}-final.jpg`);

    try {
        if (final) await download(task.result.final, download_path);
        if (inter) await Promise.all(inter_downloads);
    } catch (err) {
        console.error(err);
        throw new Error(`Error while downloading results:\n${err.toFriendly ? err.toFriendly() : err.toString()}`);
    }

    update_fn({
        state: "downloaded",
        id,
        task,
        url: task.result.final,
        path: final ? download_path : null,
        inter: inter_finished,
    });

    return {
        state: "downloaded",
        id,
        task,
        url: task.result.final,
        path: final ? download_path : null,
        inter: inter_finished,
    };
}

module.exports.styles = require("./styles.js");
module.exports.download = require("./download.js");

// Make `node .` a shorthand for `node cli.js`
if (require.main === module) {
    require("./cli.js");
}
