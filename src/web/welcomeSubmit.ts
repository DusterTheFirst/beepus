/*!
 * Copyright (C) 2019  Zachary Kohnen
 */

import { Client, RichEmbed, TextChannel } from "discord.js";
import { Request, Response } from "express";
import jwt, { JsonWebTokenError, NotBeforeError, TokenExpiredError, VerifyErrors } from "jsonwebtoken";
import { Connection } from "typeorm";
import config from "../config/config.json";
import secrets from "../config/secrets.json";
import Submission from "../database/Submission.js";
import User from "../database/User.js";
import { IUserInfo } from "./generateForm.js";

interface IWelcomeForm {
    /** The token */
    token: string;
    /** The users first name */
    firstname: string;
    /** The users last name */
    lastname: string;
    /** The person who invited the user */
    inviter: string;
    /** Extra info about the user */
    info: string;
}

export default function welcomeSubmit(client: Client, db: Connection) {
    return (req: Request, res: Response) => {
        let body = req.body as IWelcomeForm;
        let guild = client.guilds.get(config.server);

        jwt.verify(body.token, secrets.jwt, async (err: VerifyErrors | null, data: unknown) => {
            // Get the user data
            let userinfo = data as IUserInfo;

            if (err === null && guild !== undefined) {
                let channel = guild.channels.get(config.channels.submissions);

                if (channel === undefined) {
                    res.sendStatus(500);

                    return;
                }

                if (channel.type === "text" && channel instanceof TextChannel) {
                    let member = guild.member(userinfo.id);

                    // Send the submission
                    let messages = await channel.send(new RichEmbed()
                        .setColor(guild.me.displayColor)
                        .setAuthor(member.user.tag, member.user.displayAvatarURL)
                        .setFooter(member.id)
                        .setTimestamp()
                        .addField("First Name", body.firstname, true)
                        .addField("Last Name", body.lastname, true)
                        .addField("Invited By", body.inviter)
                        .addField("Extra Info", body.info));

                    // Get the single message
                    let message = Array.isArray(messages) ? messages[0] : messages;

                    // Create a user table object
                    let user = new User(member.id, body.firstname, body.lastname, body.inviter, body.info);
                    // Create a submission object
                    let submission = new Submission(user, message.id);

                    // Save the submission
                    db.getRepository(Submission).save(submission);
                }

                // FIXME: ONE PER USER, better responses

                res.send("Thank you!");
            } else {
                if (err instanceof TokenExpiredError) {
                    res.send(`This form has expired, please DM beepus with "!new" to generate a new form`);
                } else if (err instanceof NotBeforeError) {
                    res.send(`This form is not valid yet, check your time settings`);
                } else if (err instanceof JsonWebTokenError) {
                    res.send(`Token Error: ${err.message}`);
                } else {
                    res.sendStatus(500);
                }
            }
        });
    };
}