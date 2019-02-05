/*!
 * Copyright (C) 2019  Zachary Kohnen
 */

import { Client, GuildMember, RichEmbed, TextChannel } from "discord.js";
import { Request, Response } from "express";
import jwt, { JsonWebTokenError, NotBeforeError, TokenExpiredError, VerifyErrors } from "jsonwebtoken";
import moment from "moment";
import config from "./config/config.json";
import secrets from "./config/secrets.json";
import generateForm, { IUserInfo } from "./form.js";

/** The flow to run when a user joins */
export async function welcomeFlow(member: GuildMember) {
    // Auto assign roles
    // TODO: WAIT TILL HALL PASS
    // member.addRoles(config.roles.autoAssign);

    // Genertate a JWT with user info for intro
    let form = generateForm(member.user);

    // Welcome them to the server
    await member.send(new RichEmbed({
        color: member.guild.me.displayColor,
        description: `
            Welcome to the server!
            To receive your hall pass, please complete [**this form**](${form.url}) within the following ${config.expires}.
            **DO NOT** and I repeat **DO NOT** share this url with anyone for they will be able to submit the form on your behalf.

            Thank you!
        `,
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
            icon_url: member.guild.me.user.displayAvatarURL,
            text: member.guild.me.user.tag
        },
        thumbnail: {
            url: member.guild.iconURL
        },
        title: "Hello there!"
    }));
}

interface IWelcomeQuery {
    t: string;
}

/** The welcome page */
export function welcomePage(req: Request, res: Response) {
    let query = req.query as IWelcomeQuery;

    // Verify the token
    jwt.verify(query.t, secrets.jwt, {
        issuer: "beepus"
    }, (err: VerifyErrors | null, data: unknown) => {
        // Get the user data
        let user = data as IUserInfo;

        if (err === null) {
            res.render("welcome", {
                token: query.t,
                user
            });
        } else {
            if (err instanceof TokenExpiredError) {
                res.send(`This form has expired, please DM beepus with "!new" to generate a new form`);
            } else if (err instanceof NotBeforeError) {
                res.send(`This form is not valid yet, check your time settings`);
            } else if (err instanceof JsonWebTokenError) {
                res.send(`Token Error: ${err.message}`);
            }
        }
    });
}

interface IWelcomeForm {
    token: string;
    firstname: string;
    lastname: string;
    inviter: string;
    info: string;
}

export function welcomeSubmit(client: Client) {
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

                    await channel.send(new RichEmbed()
                        .setColor(guild.me.displayColor)
                        .setAuthor(member.user.tag, member.user.displayAvatarURL)
                        .addField("First Name", body.firstname, true)
                        .addField("Last Name", body.lastname, true)
                        .addField("Invited By", body.inviter)
                        .addField("Extra Info", body.info));
                }

                res.json(body);
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