/*!
 * Copyright (C) 2019  Zachary Kohnen
 */

import { User } from "discord.js";
import jwt from "jsonwebtoken";
import config from "./config/config.json";
import secrets from "./config/secrets.json";

export interface IJWTMeta {
    /** The expiration time */
    exp: number;
    /** Not Before */
    nbf?: number;
    /** Issued At */
    iat: number;
    /** Issuer */
    iss?: string;
    /** Subject */
    sub?: string;
    /** Audience */
    aud?: string;
    /** JWT ID */
    jti?: string | number;
}

export interface IUserInfo {
    id: string;
    tag: string;
}

/** Generate a welcome url */
export default function generateForm(user: User) {
    let token = jwt.sign({
        id: user.id,
        tag: user.tag
    } as IUserInfo, secrets.jwt, {
        expiresIn: config.expires,
        issuer: "beepus"
    });

    let decoded = jwt.decode(token) as IUserInfo & IJWTMeta;

    return {
        created: decoded.iat * 1000,
        expires: decoded.exp * 1000,
        url: `${config.host}/w?t=${token}`
    };
}