/*!
 * Copyright (C) 2019  Zachary Kohnen
 */

import bodyparser from "body-parser";
import compression from "compression";
import cookieParser from "cookie-parser";
import { Guild } from "discord.js";
import express from "express";
import handlebars from "express-handlebars";
import helmet from "helmet";
import { join } from "path";
import { Connection } from "typeorm";
import Submission from "../database/Submission";
import auth from "./auth";

// TODO: typeORM
export default function initWeb(port: number, guild: Guild, db: Connection) {
    const app = express();

    // Middleware
    app.use(helmet({ noSniff: true, noCache: true, hidePoweredBy: true }));
    app.use(compression());
    app.use(bodyparser.urlencoded({ extended: true }));
    app.use(cookieParser());
    app.use(auth(guild, db));

    app.engine("hbs", handlebars({ extname: "hbs", layoutsDir: join(__dirname, "..", "views") }));
    app.set("view engine", "hbs");

    // The welcome endpoint FIXME: OAUTH LOGIN
    app.get("/welcome", (req, res) => {
        res.render("welcome", {
            user: req.user
        });
    });
    // app.post("/w", welcomeSubmit(client, db));

    // Main endpoint
    app.get("/", (req, res) => res.render("index", {
        isSubmission: req.realuser instanceof Submission,
        member: req.member,
        realuser: req.realuser,
        token: req.token,
        user: req.user
    }));

    app.listen(port);
}
