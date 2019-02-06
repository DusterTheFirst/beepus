/*!
 * Copyright (C) 2019  Zachary Kohnen
 */

import { Client } from "discord.js";
import { Request, Response } from "express";
import jwt, { JsonWebTokenError, NotBeforeError, TokenExpiredError, VerifyErrors } from "jsonwebtoken";
import { Connection } from "typeorm";
import config from "../config/config.json";
import secrets from "../config/secrets.json";
import Submission from "../database/Submission.js";
import User from "../database/User.js";
import { createSubmission } from "../discord/submission.js";
import { IUserInfo } from "./generateForm.js";
import userExists, { UserStatus } from "../database/userExists.js";

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

            let userStatus = await userExists(db, userinfo.id);

            if (userStatus === UserStatus.NotRegestered) {
                
            }

            if (err === null && guild !== undefined) {
                // Create a user table object
                let user = new User(userinfo.id, body.firstname, body.lastname, body.inviter, body.info);
                // Create a submission object
                let submission = await createSubmission(user, guild);

                // Save the submission
                db.getRepository(Submission).save(submission);

                // TODO: FIXED MESSAGES
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