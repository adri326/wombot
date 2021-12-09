const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { SlashCommandBuilder } = require('@discordjs/builders');
const { Client, Intents, MessageAttachment } = require('discord.js');
const path = require("path");
const fs = require("fs");

const task = require("./task.js");
const styles = require("./styles.js");

const secret = require("./secret.json");
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

const commands = [
    new SlashCommandBuilder()
        .setName("wombo-art")
        .setDescription("Queries wombo.art!")
        .addStringOption(option =>
            option.setName("prompt")
                .setDescription("Prompt to be used by the AI")
                .setRequired(true)
        )
        .addStringOption(option => {
            let res = option.setName("style")
                .setDescription("The style to generate with")
                .setRequired(true);
            for (let [id, style] of styles) {
                res = res.addChoice(style, `style-${id}`);
            }
            return res;
        })
];

const rest = new REST({version: "9"}).setToken(secret.token);

async function updateCommands() {
    try {
        await rest.put(
            Routes.applicationCommands(secret.id),
            {
                body: commands
            }
        );
    } catch (err) {
        console.error(err);
    }
}

updateCommands();

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === "wombo-art") {
        await interaction.deferReply();

        let style = interaction.options.getString("style");
        let prompt = interaction.options.getString("prompt");
        let match_style = /^style-([0-9]+)$/.exec(style);
        if (!match_style || styles.get(+match_style[1]) === undefined) {
            interaction.editReply({
                content: "**Error:** invalid style!",
                ephemeral: true
            });
            return;
        }
        match_style = +match_style[1];

        let header = "Prompt: `" + prompt + "`, Style: `" + styles.get(match_style) + "`";

        try {
            let res = await task(prompt, match_style, (data) => {
                switch (data.state) {
                    case "authenticated":
                        interaction.editReply(header + "\n*Authenticated, allocating a task...*");
                        break;
                    case "allocated":
                        interaction.editReply(header + "\n*Allocated, submitting the prompt and style...*");
                        break;
                    case "submitted":
                        interaction.editReply(header + "\n*Submitted! Waiting on results...*");
                        break;
                    case "progress":
                        let current = data.task.photo_url_list.length;
                        let max = styles.steps.get(match_style) + 1;
                        interaction.editReply(header + "\n*Submitted! Waiting on results... (" + current + "/" + max + ")*");
                        break;
                    case "generated":
                        interaction.editReply(header + "\n*Results are in, downloading the final image...*");
                        break;
                    case "downloaded":
                        interaction.editReply(header + "\n*Downloaded! Uploading to discord...*");
                        break;
                }
            });
            const attachment = new MessageAttachment(fs.readFileSync(res.path), path.basename(res.path));
            interaction.editReply(header);
            interaction.followUp({
                files: [attachment]
            });
        } catch (err) {
            interaction.editReply(header + "\n**Error!**```\n" + err.message + "\n```");
        }
    }
});

client.login(secret.token);
