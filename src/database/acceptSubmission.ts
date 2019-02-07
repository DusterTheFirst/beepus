/*!
 * Copyright (C) 2019  Zachary Kohnen
 */

import { Connection } from "typeorm";
import RealUser from "./RealUser";
import Submission from "./Submission";

/** Move the submission to the users database */
export default async function acceptSubmission(db: Connection, submission: Submission) {
    await db.getRepository(Submission).remove(submission);
    await db.getRepository(RealUser).save(submission.user);
}