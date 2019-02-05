/*!
 * Copyright (C) 2019  Zachary Kohnen
 */

// tslint:disable:no-import-side-effect
import "reflect-metadata";
import initDB from "./database/init.js";
import Submission from "./database/Submission.js";
import initDiscord from "./discord/init.js";
import initWeb from "./web/init.js";

// if (!existsSync(join(__dirname, config.db))) {
//     writeFileSync(join(__dirname, config.db), "");
// }

(async () => {
    let database =  await initDB();
    let client = initDiscord(database);
    initWeb(4747, client, database);

    console.log(await database.getRepository(Submission).find());

    console.log("Everything is up and running!");
})();