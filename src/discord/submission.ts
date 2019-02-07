/*!
 * Copyright (C) 2019  Zachary Kohnen
 */

import { Guild, RichEmbed, TextChannel } from "discord.js";
import config from "../config/config.json";
import RealUser from "../database/RealUser";
import Submission from "../database/Submission";

/** Send a submission to the discord */
export async function createSubmission(user: RealUser, guild: Guild): Promise<Submission> {
    let member = guild.member(user.id);

    let channel = guild.channels.find(x => x.id === config.channels.submissions) as TextChannel;

    // Send the submission
    let messages = await channel.send(new RichEmbed()
        .setColor(guild.me.displayColor)
        .setAuthor(member.user.tag, member.user.displayAvatarURL)
        .setFooter(member.id)
        .setTimestamp()
        .addField("First Name", user.firstname, true)
        .addField("Last Name", user.lastname, true)
        .addField("Invited By", user.inviter)
        .addField("Extra Info", user.info));

    // Get the single message
    let message = Array.isArray(messages) ? messages[0] : messages;

    return new Submission(user, message.id);
}

/** Send a submission to the discord */
export async function removeSubmission(submission: Submission, guild: Guild) {
    // TODO:
}