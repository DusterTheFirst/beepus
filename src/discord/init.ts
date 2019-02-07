/*!
 * Copyright (C) 2019  Zachary Kohnen
 */

import { Client, TextChannel } from "discord.js";
import { Connection } from "typeorm";
import config from "../config/config.json";
import secrets from "../config/secrets.json";
import Submission from "../database/Submission.js";
// import { parse } from "./commands.js";
// import { welcomeFlow } from "./welcome.js";

export default async function initDiscord(db: Connection) {
    const client = new Client();

    client.on("ready", async () => {
        // Get the CAH guild
        let guild = client.guilds.get(config.server);

        // Connect
        console.log(`${client.user.tag} connected!`);

        // Make sure the bot is in the guild
        if (guild === undefined) {
            console.error(`The bot is not in the server specified by 'config.server'`);
            process.exit(1);

            return;
        }

        // Get the submissions channel
        let channel = guild.channels.find(x => x.id === config.channels.submissions) as TextChannel;

        // Get all the messages from the channel
        let messages = await channel.fetchMessages();

        // Get all the submissions that are pending
        let submissions = db.getRepository(Submission);

        // Loop through all messages in the channel
        for (let [id, message] of messages) {
            // Get the submission that matches the message
            let submission = await submissions.find({ message: id });
            // If the submission doesnt exist, remove the message
            if (submission.length === 0) {
                await message.delete();
            }
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