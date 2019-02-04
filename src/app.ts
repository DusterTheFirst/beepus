/*!
 * Copyright (C) 2019  Zachary Kohnen
 */

import chalk from "chalk";
import { Client } from "discord.js";
import express from "express";
import { parse } from "./commands.js";
import config from "./config.json";
import secrets from "./secrets.json";
import { welcomeEndpoint, welcomeFlow } from "./welcome.js";

const client = new Client();
const app = express();

// The welcome endpoint
app.get("/w", welcomeEndpoint);

client.on("ready", async () => {
    let guild = client.guilds.get(config.server);

    console.log(chalk`{green ${client.user.tag} connected!}`);

    if (guild === undefined) {
        console.error(chalk`{red The bot is not in the server specified by 'config.server'}`);
        process.exit(1);

        return;
    }

    // TODO: REMOVE
    await welcomeFlow(guild.member("168827261682843648"));

    guild.members.forEach(async x => x.removeRole(config.roles.hallpass));
});

// TODO: VOICE MEME FORTNIGHT
// TODO: ADMITTANCE TICKETS
// TODO: whois command/whoami/changewhoiam commands for identities
client.on("message", parse);

client.on("guildMemberAdd", welcomeFlow);

client.login(secrets.token).catch((e) => console.error(e));
app.listen(8080);