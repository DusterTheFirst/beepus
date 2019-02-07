/*!
 * Copyright (C) 2019  Zachary Kohnen
 */

import { Connection } from "typeorm";
import RealUser from "./RealUser";
import Submission from "./Submission";

export const enum UserStatus {
    NotRegestered,
    Pending,
    Regestered
}

/** Check a users status */
export default async function userStatus(db: Connection, userid: string): Promise<UserStatus> {
    // Get already regestered users/submissions
    let currentSubmissions = await db.getRepository(Submission).count({where: userid});
    let currentUsers = await db.getRepository(RealUser).count({where: userid});

    console.log(currentSubmissions);

    if (currentSubmissions !== 0) {
        // res.send("You have already submitted this form");

        return UserStatus.Pending;
    } else if (currentUsers !== 0) {
        // res.send("You already are regestered!");

        return UserStatus.Regestered;
    } else {
        return UserStatus.NotRegestered;
    }
}