/*!
 * Copyright (C) 2019  Zachary Kohnen
 */

import { join } from "path";
import { createConnection } from "typeorm";
import Submission from "./Submission";
import User from "./User";

export default async function initDB() {
    return createConnection({
        database: join(__dirname, "db.sqlite"),
        entities: [
            User,
            Submission
        ],
        synchronize: true,
        type: "sqlite"
    });
}