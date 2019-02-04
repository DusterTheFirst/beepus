/*!
 * Copyright (C) 2019  Zachary Kohnen
 */

import { GuildMember, RichEmbed, User } from "discord.js";
import { Request, Response } from "express";
import jwt, { JsonWebTokenError, NotBeforeError, TokenExpiredError, VerifyErrors } from "jsonwebtoken";
import config from "./config.json";
import secrets from "./secrets.json";

/** The flow to run when a user joins */
export async function welcomeFlow(member: GuildMember) {
    // Auto assign roles
    // TODO: WAIT TILL HALL PASS
    // member.addRoles(config.roles.autoAssign);

    // Welcome them to the server
    // Genertate a JWT with user info for intro
    await member.send(new RichEmbed({
        color: member.guild.me.displayColor,
        description: `
            Welcome to the server!
            To reciebe your hall pass, please complete [**this form**](${generateFormURL(member.user)}) within the following ${config.expires}.
            **DO NOT** and I repeat **DO NOT** share this url with anyone for they will be able to submit the form on your behalf.

            Thank you!
        `,
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

/** Generate a welcome url */
export function generateFormURL(user: User) {
    let token = jwt.sign({
        id: user.id,
        tag: user.tag
    } as IUserInfo, secrets.jwt, {
        expiresIn: config.expires,
        issuer: "beepus"
    });

    return `${config.host}/w?t=${token}`;
}

export interface IUserInfo {
    id: string;
    tag: string;
}

export interface IWelcomeQuery {
    t: string;
}

export function welcomeEndpoint(req: Request, res: Response) {
    let query = req.query as IWelcomeQuery;

    // Verify the token
    jwt.verify(query.t, secrets.jwt, {
        issuer: "beepus"
    }, (err: VerifyErrors | null, data: unknown) => {
        // Get the user data
        let user = data as IUserInfo;

        if (err === null) {
            res.send(`Hello ${user.tag}! this will be setup soon!`);
        } else {
            if (err instanceof TokenExpiredError) {
                res.send(`This token has expired, please DM beepus with "!new"`);
            } else if (err instanceof NotBeforeError) {
                res.send(`This token is not valid yet`);
            } else if (err instanceof JsonWebTokenError) {
                res.send(`Token Error: ${err.message}`);
            }
        }
    });
}