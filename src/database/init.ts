/*!
 * Copyright (C) 2019  Zachary Kohnen
 */

import { createConnection } from "typeorm";
import RealUser from "./RealUser";
import Submission from "./Submission";

export default async function initDB() {
    return createConnection({
        database: "db.sqlite",
        entities: [
            RealUser,
            Submission
        ],
        synchronize: true,
        type: "sqlite"
    });
}