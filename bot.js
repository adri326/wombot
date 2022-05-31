const Eris = require("eris");
const fs = require("fs");
const path = require("path");

const task = require("./index.js");
const styles = require("./styles.js");

const secret = require("./secret.json");

const PREFIX = "wb!";
const client = new Eris(secret.token, {
    intents: [
        "guilds",
        "guildMessages",
    ]
});

const stylesParsed = new Map([...styles.entries()].map(([id, name]) => {
    name = name.toLowerCase().replace(/\s+/g, "-");
    name = name.replace(/[^a-z0-9\-]/g, "");
    return [name, id];
}));

const HELP_MESSAGE = `Commands:
\`wb!art <style> <prompt>\`
- \`<prompt>\`: your prompt, must be shorter than 100 characters
- \`<style>\`: the style to use, must be one of:\n${
    ([...stylesParsed.entries()].map(([name, id]) => {
        return `  - \`${name}\`: ${styles.get(id)}`;
    })).join("\n")
}`;


client.on("messageCreate", async (msg) => {
    if (msg.content.startsWith(PREFIX + "help")) {
        msg.channel.createMessage({
            content: HELP_MESSAGE,
            messageReference: {messageID: msg.id}
        }).then(() => {}).catch(console.error);
    } else if (msg.content.startsWith(PREFIX + "art")) {
        // Extract arguments
        let style = stylesParsed.get(msg.content.toLowerCase().split(" ")[1]);
        let prompt = msg.content.split(" ").slice(2).join(" ").slice(0, 100);

        if (prompt.startsWith("`") && prompt.endsWith("`")) {
            prompt = prompt.slice(1, -1);
        }

        if (!style) {
            return msg.channel.createMessage("**Error:** invalid style!");
        }

        let header = "Prompt: `" + prompt.replace(/`/g, "'") + "`, Style: `" + styles.get(style) + "`";
        let reply = null;

        try {
            reply = await msg.channel.createMessage(
                {
                    content: header,
                    messageReference: {
                        messageID: msg.id
                    }
                }
            );

            let res = await task(prompt, style, (data) => {
                switch (data.state) {
                    case "authenticated":
                        msg.channel.editMessage(reply.id, header + "\n*Authenticated, allocating a task...*");
                        break;
                    case "allocated":
                        msg.channel.editMessage(reply.id, header + "\n*Allocated, submitting the prompt and style...*");
                        break;
                    case "submitted":
                        msg.channel.editMessage(reply.id, header + "\n*Submitted! Waiting on results...*");
                        break;
                    case "progress":
                        let current = data.task.photo_url_list.length;
                        let max = styles.steps.get(style) + 1;
                        msg.channel.editMessage(reply.id, header + "\n*Submitted! Waiting on results... (" + current + "/" + max + ")*");
                        break;
                    case "generated":
                        msg.channel.editMessage(reply.id, header + "\n*Results are in, downloading the final image...*");
                        break;
                    case "downloaded":
                        msg.channel.editMessage(reply.id, header + "\n*Downloaded! Uploading to discord...*");
                        break;
                }
            });

            const attachment = fs.readFileSync(res.path);
            msg.channel.editMessage(reply.id, header);
            await msg.channel.createMessage({
                content: "",
                messageReference: {messageID: reply.id},
            }, {file: attachment, name: path.basename(res.path)});
        } catch (err) {
            console.error(err);
            if (reply) {
                msg.channel.editMessage(reply.id, "**Error:** " + err.toString());
            }
        }
    }
});

client.on("ready", () => {
    client.editStatus("online", {
        name: "wb!help",
        type: 0,
    });
    console.log(`Logged in as ${client.user.username}#${client.user.discriminator}!`);
});

client.connect();
