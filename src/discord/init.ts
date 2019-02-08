/*!
 * Copyright (C) 2019  Zachary Kohnen
 */

import { Client, Message, RichEmbed, TextChannel } from "discord.js";
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
    // TODO: whois command/whoami/changewhoiam commands for identities
    client.on("message", async (message) => {
        // Ignore self messages or from other bots
        if (message.author.bot) return;

        if (message.mentions.everyone) {
            // Tell dummies to shut it
            await message.member.send(config.messages.everyone);
        } else if (message.content.startsWith(message.guild.me.user.toString())) {
            // Commands
            let content = message.content.replace(message.guild.me.user.toString(), "").trim();

            // Command for game roles
            if (content.toLowerCase().startsWith("i play")) {
                // Get the game
                let game = content.replace(/i play/i, "").trim().toLowerCase();

                // Give them a the role if it exists
                if (config.roles.games.includes(game)) {
                    if (message.member.roles.map(x => x.name).includes(game)) {
                        let msg = await message.channel.send(`You already have the role \`${game}\`!`) as Message;
                        // Delete after ten seconds
                        client.setTimeout(() => msg.delete(), 10000);
                    } else {
                        // Give them the role
                        await message.member.addRole(message.guild.roles.find(x => x.name === game));
                        // Send the message
                        let msg = await message.reply("There you go!") as Message;
                        // Delete after ten seconds
                        client.setTimeout(() => msg.delete(), 10000);
                    }
                } else {
                    await message.channel.send(`Sorry there is no role for the game \`${game}\`. If you feel this game should be added please DM one of your overlords`);
                }
            } else if (content.toLowerCase().startsWith("i do not play")) {
                // Get the game
                let game = content.replace(/i do not play/i, "").trim().toLowerCase();

                // Give them a the role if it exists
                if (config.roles.games.includes(game)) {
                    if (message.member.roles.map(x => x.name).includes(game)) {
                        // Give them the role
                        await message.member.removeRole(message.guild.roles.find(x => x.name === game));
                        // Send the message
                        let msg = await message.reply("Bye!") as Message;
                        // Delete after ten seconds
                        client.setTimeout(() => msg.delete(), 10000);
                    } else {
                        let msg = await message.channel.send(`You do not have the role \`${game}\`!`) as Message;
                        // Delete after ten seconds
                        client.setTimeout(() => msg.delete(), 10000);
                    }
                } else {
                    await message.channel.send(`Sorry there is no role for the game \`${game}\`. If you feel this game should be added please DM one of your overlords.`);
                }
            } else if (content.match(/what games (are there|can i play|do you have)/i)) {
                await message.channel.send(`Thanks for asking, I have all of the following games.\n\`\`\`md\n${config.roles.games.map(x => `# ${x}`).join("\n")}\n\`\`\``);
            } else if (content.toLowerCase().includes("help")) {
                let commands = [
                    {
                        description: "Get a game role",
                        name: "i play",
                        params: "<game>"
                    },
                    {
                        description: "Remove a game role",
                        name: "i do not play",
                        params: "<game>"
                    },
                    {
                        description: "Get a list of games",
                        name: "what games are there"
                    },
                    {
                        description: "Get this help",
                        name: "help"
                    }
                ];

                await message.channel.send(
                    new RichEmbed()
                        .setTitle("Commands")
                        .setDescription(commands.map(x => `${message.guild.me.toString()} **${x.name}** ${x.params === undefined ? `- ${x.description}` : `${x.params} - ${x.description}`}`).join("\n"))
                        .setColor(message.guild.me.displayColor)
                );
            }
        } else if (message.mentions.users.has(message.guild.me.user.id)) {
            // Just say hi
            await message.reply("Hi there!");
        }
    });

    client.on("guildMemberAdd", (member) =>
        member.send(
            new RichEmbed()
                .setTitle("Welcome!")
                .setDescription(`Hello there! I am your friendly neighborhood beepus! Please fill out [**this form**](${config.web.host}) to obtain your hall pass.`)
                .setTimestamp()
                .setFooter(member.guild.me.user.tag, member.guild.me.user.displayAvatarURL)
                .setColor(member.guild.me.displayColor)
                .setThumbnail(member.guild.iconURL)
        )
    );

    client.on("error", (err) => console.error(err));

    client.login(secrets.client.token).catch((e) => console.error(e));

    return client;
}