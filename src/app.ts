/*!
 * Copyright (C) 2019  Zachary Kohnen
 */

// tslint:disable:no-import-side-effect
import "reflect-metadata";
import config from "./config/config.json";
import initDB from "./database/init.js";
import initDiscord from "./discord/init.js";
import initWeb from "./web/init.js";

(async () => {
    let database = await initDB();
    let client = await initDiscord(database);

    // Init modules that require client
    client.once("ready", () => {
        // Get the guild
        let guild = client.guilds.find(x => x.id === config.server);

        // Initialize the website
        initWeb(4747, guild, database);
    });
})()
    .then(() => console.log("Everything is up and running!"))
    .catch((error: object) => console.error(error.toString()));
