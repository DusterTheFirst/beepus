/*!
 * Copyright (C) 2019  Zachary Kohnen
 */

import { Request, Response } from "express";
import jwt, { JsonWebTokenError, NotBeforeError, TokenExpiredError, VerifyErrors } from "jsonwebtoken";
import secrets from "../config/secrets.json";
import { IUserInfo } from "./generateForm.js";

interface IWelcomeQuery {
    t: string;
}

/** The welcome page */
export default function welcomePage(req: Request, res: Response) {
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