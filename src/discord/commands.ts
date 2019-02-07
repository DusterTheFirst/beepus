/*!
 * Copyright (C) 2019  Zachary Kohnen
 */

import { Message } from "discord.js";
import config from "../config/config.json";

export function parse() {
    return async (message: Message) => {
        let guild = message.client.guilds.get(config.server);
        if (guild === undefined) return;

        // Ignore self messages or from other bots
        if (message.author.bot) return;

        // Listen for DM messages
        if (message.channel.type === "dm") {
            /* // Log the message
            console.log(message.content, message.author.tag);

            if (!guild.member(message.author).roles.has(config.roles.hallpass)) {
                if (message.content === "!new") {
                    let form = generateForm(message.author);
                    let me =  message.client.user;

                    if (await userStatus(db, message.author.id) !== UserStatus.NotRegestered) return;

                    await message.author.send(new RichEmbed({
                        color: guild.me.displayColor,
                        fields: [
                            {
                                inline: true,
                                name: "Created At",
                                value: moment(form.created).format("hh:mm a")
                            },
                            {
                                inline: true,
                                name: "Expires At",
                                value: moment(form.expires).format("hh:mm a")
                            }
                        ],
                        footer: {
                            icon_url: me.displayAvatarURL,
                            text: me.tag
                        },
                        thumbnail: {
                            url: guild.iconURL
                        },
                        title: "Here yo go!",
                        url: form.url
                    }));
                }
            } else {
                await message.author.send("You already have the hall pass!");
            } */

            // // Listen for messages from users without the hall pass
            // if (guild.member(message.author).roles.has(config.roles.hallpass)) {
            //     message.reply("Hello there! You already have the hall pass role, so this DM will be ignored.");
            // } else {
            //     message.reply("Thank you for the response");
            // }
        } else if (message.mentions.everyone) {
            // Tell dummies to shut it
            await message.member.send(config.messages.everyone);
        } else if (message.mentions.users.has(message.guild.me.user.id)) {
            // Commands go here
            await message.reply("Hi there!");
        }
    };
}