/*!
 * Copyright (C) 2019  Zachary Kohnen
 */

import { Connection } from "typeorm";
import RealUser from "./RealUser";
import Submission from "./Submission";

/** Move the submission to the users database */
export default function acceptSubmission(db: Connection, submission: Submission) {
    db.getRepository(Submission).remove(submission);
    db.getRepository(RealUser).save(submission.user);
}