/*!
 * Copyright (C) 2019  Zachary Kohnen
 */

import { Client } from "discord.js";
import { Connection } from "typeorm";
import config from "../config/config.json";
import secrets from "../config/secrets.json";
// import { parse } from "./commands.js";
// import { welcomeFlow } from "./welcome.js";

export default function initDiscord(db: Connection) {
    const client = new Client();

    client.on("ready", async () => {
        let guild = client.guilds.get(config.server);

        console.log(`${client.user.tag} connected!`);

        if (guild === undefined) {
            console.error(`The bot is not in the server specified by 'config.server'`);
            process.exit(1);

            return;
        }
    });

    // TODO: VOICE MEME FORTNIGHT
    // TODO: ADMITTANCE TICKETS
    // TODO: whois command/whoami/changewhoiam commands for identities
    // client.on("message", parse(db));

    // client.on("guildMemberAdd", welcomeFlow);

    client.on("error", (err) => console.error(err));

    client.login(secrets.client.token).catch((e) => console.error(e));

    return client;
}