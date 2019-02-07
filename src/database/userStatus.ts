/*!
 * Copyright (C) 2019  Zachary Kohnen
 */

import { Connection } from "typeorm";
import RealUser from "./RealUser";
import Submission from "./Submission";

export const enum UserStatus {
    NotRegistered,
    Pending,
    Registered
}

/** Check a users status */
export default async function userStatus(db: Connection, userid: string): Promise<UserStatus> {
    // Get already registered users/submissions
    let currentSubmission = await db.getRepository(Submission).findOne(userid);
    let currentUser = await db.getRepository(RealUser).findOne(userid);

    if (currentSubmission !== undefined) {
        return UserStatus.Pending;
    } else if (currentUser !== undefined) {
        return UserStatus.Registered;
    } else {
        return UserStatus.NotRegistered;
    }
}