/*!
 * Copyright (C) 2019  Zachary Kohnen
 */

import bodyparser from "body-parser";
import { Client } from "discord.js";
import express from "express";
import handlebars from "express-handlebars";
import { existsSync, writeFileSync } from "fs";
import helmet from "helmet";
import { join } from "path";
import { parse } from "./commands.js";
import config from "./config/config.json";
import secrets from "./config/secrets.json";
import { welcomeFlow, welcomePage, welcomeSubmit } from "./welcome.js";

const client = new Client();

if (!existsSync(join(__dirname, config.db))) {
    writeFileSync(join(__dirname, config.db), "");
}

client.on("ready", async () => {
    let guild = client.guilds.get(config.server);

    console.log(`${client.user.tag} connected!`);

    if (guild === undefined) {
        console.error(`The bot is not in the server specified by 'config.server'`);
        process.exit(1);

        return;
    }

    guild.members.forEach(async x => x.removeRole(config.roles.hallpass));
});

// TODO: VOICE MEME FORTNIGHT
// TODO: ADMITTANCE TICKETS
// TODO: whois command/whoami/changewhoiam commands for identities
client.on("message", parse);

client.on("guildMemberAdd", welcomeFlow);

client.on("error", (err) => console.error(err));

client.login(secrets.token).catch((e) => console.error(e));