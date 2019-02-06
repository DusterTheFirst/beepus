/*!
 * Copyright (C) 2019  Zachary Kohnen
 */

// tslint:disable:no-import-side-effect
import "reflect-metadata";
import initDB from "./database/init.js";
import initDiscord from "./discord/init.js";
import initWeb from "./web/init.js";

(async () => {
    let database =  await initDB();
    let client = initDiscord(database);
    initWeb(4747, client, database);

    console.log("Everything is up and running!");
})();