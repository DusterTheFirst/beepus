/*!
 * Copyright (C) 2019  Zachary Kohnen
 */

import chalk from "chalk";
import { Client } from "discord.js";
import config from "./config.json";

const client = new Client();

client.on("ready", () => {
    let guild = client.guilds.get(config.server);

    console.log(chalk`{green ${client.user.tag} connected!}`);

    if (guild === undefined) {
        console.error(chalk`{red The bot is not in the server specified by 'config.server'}`);
        process.exit(1);

        return;
    }

    guild.member("168827261682843648").send(config.messages.welcome);
});

// TODO: ADMITTANCE TICKETS
// TODO: whois command/whoami/changewhoiam commands for identities
client.on("message", (message) => {
    let guild = client.guilds.get(config.server);

    // Stop if the guild is a no no
    if (guild === undefined) {
        console.error(chalk`{red The bot is not in the server specified by 'config.server'}`);
        process.exit(1);

        return;
    }

    // Ignore self messages or from other bots
    if (message.author.bot) return;

    // Listen for DM messages
    if (message.channel.type === "dm") {
        // Log the message
        console.log(message.content, message.author.tag);

        // Listen for messages from users without the hall pass
        if (guild.member(message.author).roles.has(config.roles.hallpass)) {
            message.reply("Hello there! You already have the hall pass role, so this DM will be ignored.");
        } else {
            message.reply("Thank you for the response");
        }
    } else if (message.mentions.everyone) {
        // Tell dummies to shut it
        message.member.send(config.messages.everyone);
    } else if (message.mentions.users.has(client.user.id)) {
        // Commands go here
        message.reply("Hi there!");
    }
});

client.on("guildMemberAdd", (member) => {
    // Auto assign roles
    // TODO: WAIT TILL HALL PASS
    member.addRoles(config.roles.autoAssign);

    // Welcome them to the server
    member.send(config.messages.welcome);
});

client.login(config.token);