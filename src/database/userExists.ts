/*!
 * Copyright (C) 2019  Zachary Kohnen
 */

import { Connection } from "typeorm";
import Submission from "./Submission";
import User from "./User";

export const enum UserStatus {
    NotRegestered,
    Pending,
    Regestered
}

export default async function userExists(db: Connection, userid: string): Promise<UserStatus> {
    // Get already regestered users/submissions
    let currentSubmissions = await db.getRepository(Submission).count({where: userid});
    let currentUsers = await db.getRepository(User).count({where: userid});

    console.log(currentSubmissions);

    if (currentSubmissions !== 0) {
        res.send("You have already submitted this form");

        return;
    } else if (currentUsers !== 0) {
        res.send("You already are regestered!");

        return;
    }
}