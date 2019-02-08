/*!
 * Copyright (C) 2019  Zachary Kohnen
 */

import { Guild, TextChannel } from "discord.js";
import { Connection } from "typeorm";
import config from "../config/config.json";
import RealUser from "./RealUser";
import Submission from "./Submission";

/** Move the submission to the users database */
export default async function acceptSubmission(db: Connection, user: string, guild: Guild) {
    // Get the submission
    let submission = await db.getRepository(Submission).findOne(user);
    if (submission === undefined) return false;

    // Move the user
    await db.getRepository(RealUser).save(submission.user);
    await db.getRepository(Submission).remove(submission);

    // Get the submissions channel
    let channel = guild.channels.find(x => x.id === config.channels.submissions) as TextChannel;
    // Get the submission message
    let message = await channel.fetchMessage(submission.message);
    // Delete the messsage
    await message.delete();

    return true;
}