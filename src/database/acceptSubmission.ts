/*!
 * Copyright (C) 2019  Zachary Kohnen
 */

import { Connection } from "typeorm";
import Submission from "./Submission";
import User from "./User";

/** Move the submission to the users database */
export default function acceptSubmission(db: Connection, submission: Submission) {
    db.getRepository(Submission).remove(submission);
    db.getRepository(User).save(submission.user);
}