/*!
 * Copyright (C) 2019  Zachary Kohnen
 */

import OAuth, { Data, Token } from "client-oauth2";
import { Guild, GuildMember } from "discord.js";
import { Router } from "express";
import jwt from "jsonwebtoken";
import moment from "moment";
import fetch from "node-fetch";
import { Connection } from "typeorm";
import config from "../config/config.json";
import secrets from "../config/secrets.json";
import RealUser from "../database/RealUser.js";
import Submission from "../database/Submission.js";
import userStatus, { UserStatus } from "../database/userStatus.js";

const discordAuth = new OAuth({
    accessTokenUri: "https://discordapp.com/api/oauth2/token",
    authorizationUri: "https://discordapp.com/api/oauth2/authorize",
    clientId: secrets.client.id,
    clientSecret: secrets.client.secret,
    redirectUri: `${config.web.host}/auth/redirect`,
    scopes: ["identify"]
});

// TODO: TIE IN WITH DATABASE

/** Discord OAuth middleware */
export default function auth(guild: Guild, db: Connection) {
    // Router for login, logout and redirect routes
    let router = Router();

    // Redirect to auth page
    router.get("/auth/login", (req, res) => {
        let ref = req.header("Referrer");

        res.redirect(
            discordAuth.code.getUri({
                state: encodeURIComponent(ref !== undefined ? ref : "/")
            })
        );
    });

    // Consume the token
    router.get("/auth/redirect", async (req, res) => {
        try {
            // Get the token from the URL
            let token = await discordAuth.code.getToken(req.originalUrl);
            // Get the referrer
            let state = decodeURIComponent((req.query as { state: string }).state);

            // Create a cookie with the details
            let cookie = jwt.sign({
                accessToken: token.accessToken,
                data: token.data,
                refreshToken: token.refreshToken,
                tokenType: token.tokenType
            } as IJWTDiscordAuth, secrets.keys.jwt, {
                    audience: "self",
                    expiresIn: "1 year",
                    issuer: "beepus",
                    subject: "Discord Auth"
                });

            // Save the cookie for 10 years
            res.cookie("token", cookie, {
                expires: moment().add(10, "years").toDate()
            }).redirect(state); // Redirect to the page that caused the login
        } catch {
            res.redirect("/");
        }
    });

    // Middlware
    router.use(async (req, res, next) => {
        // Get the token from the cookies
        let { token: cookie } = req.cookies as IAuthCookies;

        // Make sure the cookie exists
        if (cookie !== undefined) {
            try {
                // Get the data from the token and check its signature
                let data = jwt.verify(cookie, secrets.keys.jwt) as IJWTDiscordAuth;

                // Create a new token instance
                let token = discordAuth.createToken(data.accessToken, data.refreshToken, data.tokenType, data.data);

                // Make sure the token has not expired
                if (token.expired()) {
                    // Refresh the token if it has expired
                    await token.refresh();
                }

                // Get the user, refreshing the token if it is invalid
                let user = await getUser(token);

                // Pass the user, member, realuser, and token to the next middleware.
                req.user = user;
                req.member = user !== undefined ? guild.member(user.id) : undefined;
                req.token = token;

                // Get the RealUser from the discord user
                if (user !== undefined) {
                    // Get the userStatus
                    req.realuserStatus = await userStatus(db, user.id);

                    // Get the RealUser
                    req.realuser = await db.getRepository(RealUser).findOne(user.id);

                    // If there is no RealUser, get the Submission
                    if (req.realuser === undefined) {
                        req.realuser = await db.getRepository(Submission).findOne(user.id);
                    }
                }
            } catch (e) {
                // Clear the cookie
                res.cookie("token", "", { expires: new Date(0) });
            }
        }

        next();
    });

    // Revoke and remove token
    router.get("/auth/logout", async (req, res) => {
        if (req.token !== undefined) {
            // Revoke the token
            await fetch(`https://discordapp.com/api/oauth2/token/revoke?token=${req.token.accessToken}`);
        }

        // Clear the cookie
        res.cookie("token", "", { expires: new Date(0) });

        // Go back
        let ref = req.header("Referrer");
        res.redirect(ref !== undefined ? ref : "/");
    });

    return router;
}

/** Get a user, and retry if the token is invalid */
async function getUser(token: Token, secondattempt = false): Promise<IDiscordUser | undefined> {
    // Make a request to get the user
    let response = await fetch("https://discordapp.com/api/v6/users/@me", {
        headers: {
            Authorization: `Bearer ${token.accessToken}`
        }
    });

    // Check for invalid token
    if (response.status === 401) {
        // Do not loop more than twice
        if (secondattempt) {
            return undefined;
        }
        // Refresh the token
        await token.refresh();

        // Try again
        return getUser(token, true);
    } else {
        // Send the success result
        return response.json();
    }
}

/** The discord auth stored in the JWT */
export interface IJWTDiscordAuth {
    accessToken: string;
    tokenType: string;
    refreshToken: string;
    data: Data;
}

/** The cookies set for the auth */
export interface IAuthCookies {
    token?: string;
}

/** A discord user from the api */
export interface IDiscordUser {
    id: string;
    username: string;
    discriminator: string;
    avatar: string;
    mfa_enabled: boolean;
    verified: boolean;
    flags: number;
    locale: string;
}

declare global {
    namespace Express {
        // tslint:disable-next-line:interface-name
        export interface Request {
            /** The simple discord user from the api */
            user?: IDiscordUser;
            /** The guild member */
            member?: GuildMember;
            /** The auth token */
            token?: Token;
            /** The RealUser or submission tied to the user */
            realuser?: RealUser | Submission;
            /** The status of the discord user */
            realuserStatus?: UserStatus;
        }
    }
}