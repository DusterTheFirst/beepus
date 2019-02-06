/*!
 * Copyright (C) 2019  Zachary Kohnen
 */

import bodyparser from "body-parser";
import { Client } from "discord.js";
import express from "express";
import handlebars from "express-handlebars";
import helmet from "helmet";
import { join } from "path";
import { Connection } from "typeorm";
import welcomePage from "./welcomePage";
import welcomeSubmit from "./welcomeSubmit";

export default function initWeb(port: number, client: Client, db: Connection) {
    const app = express();

    // Middleware
    app.use(helmet({ noSniff: true, noCache: true, hidePoweredBy: true }));
    app.use(bodyparser.urlencoded({ extended: true }));

    app.engine("hbs", handlebars({ extname: "hbs", layoutsDir: join(__dirname, "..", "views") }));
    app.set("view engine", "hbs");

    // The welcome endpoint
    app.get("/w", welcomePage);
    app.post("/w", welcomeSubmit(client, db));

    // Main endpoint
    app.get("/", (_req, res) => res.send("beep beep"));

    app.listen(port);
}
