/*!
 * Copyright (C) 2019  Zachary Kohnen
 */

import bodyparser from "body-parser";
import compression from "compression";
import cookieParser from "cookie-parser";
import csrf from "csurf";
import { Guild } from "discord.js";
import express, { NextFunction, Request, Response } from "express";
import handlebars from "express-handlebars";
import helmet from "helmet";
import fetch from "node-fetch";
import sass from "node-sass-middleware";
import { join } from "path";
import { Connection } from "typeorm";
import RealUser from "../database/RealUser";
import Submission from "../database/Submission";
import { UserStatus } from "../database/userStatus";
import { createSubmission } from "../discord/submission";
import auth from "./auth";

// TODO: typeORM
export default function initWeb(port: number, guild: Guild, db: Connection) {
    const app = express();

    // Middleware
    app.use(helmet({ noSniff: true, noCache: true, hidePoweredBy: true }));
    app.use(compression());
    app.use(bodyparser.urlencoded({ extended: true }));
    app.use(cookieParser());
    app.use(csrf({ cookie: true }));
    app.use(auth(guild, db));

    // SASS
    app.use(sass({
        dest: join(__dirname, "..", "..", "views", "styles"),
        outputStyle: "compressed",
        prefix:  "/styles",
        src: join(__dirname, "..", "..", "views", "sass")
    }));
    app.use("/styles", express.static(join(__dirname, "..", "..", "views", "styles")));

    // Favicon
    app.get("/favicon.ico", async (_req, res) => {
        // Get the current bot avatar
        let response = await fetch(guild.me.user.displayAvatarURL);
        // Get the content type
        let content = response.headers.get("Content-Type");

        // Send the content type if it exists
        if (content !== null) {
            res.type(content);
        }

        // Send the status and the data
        res.status(response.status).send(await response.buffer());
    });

    // Handlebars
    app.engine("hbs", handlebars({ extname: "hbs", layoutsDir: join(__dirname, "..", "..", "views") }));
    app.set("view engine", "hbs");

    console.log(`Using handlebars in the '${join(__dirname, "..", "..", "views")}' directory`);

    // The welcome endpoint
    app.get("/welcome", (req, res) => {
        res.render("welcome", {
            csrfToken: req.csrfToken(),
            member: req.member,
            realuser: req.realuser,
            realuserStatus: {
                notRegistered: req.realuserStatus === UserStatus.NotRegistered,
                pending: req.realuserStatus === UserStatus.Pending,
                registered: req.realuserStatus === UserStatus.Registered
            },
            token: req.token,
            user: req.user
        });
    });
    app.post("/welcome", async (req, res) => {
        if (req.realuserStatus === UserStatus.NotRegistered && req.user !== undefined && req.body !== undefined) {
            let body = req.body as IWelcomeForm;

            let user = new RealUser(req.user.id, body.firstname, body.lastname, body.inviter, body.info);
            await db.getRepository(Submission).save(await createSubmission(user, guild));
        }

        res.redirect("/welcome");
    });

    // Main endpoint
    app.get("/", (req, res) => res.render("index", {
        member: req.member,
        realuser: req.realuser,
        realuserStatus: {
            notRegistered: req.realuserStatus === UserStatus.NotRegistered,
            pending: req.realuserStatus === UserStatus.Pending,
            registered: req.realuserStatus === UserStatus.Registered
        },
        token: req.token,
        user: req.user
    }));

    app.use("*", (req, res) => res.render("error", {
        error: "404",
        message: "Page not found",
        user: req.user
    }));

    app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
        if (isEBADCSRFTOKEN(err)) {
            res.render("error", {
                error: "403",
                message: "Form tampered with",
                user: req.user
            });
        } else {
            res.render("error", {
                error: "500",
                message: "Internal error",
                user: req.user
            });
        }
        console.error(err);
    });

    app.listen(port);
}

function isEBADCSRFTOKEN(err: unknown): err is Error & { code: "EBADCSRFTOKEN" } {
    return (err as { code: string }).code === "EBADCSRFTOKEN";
}

interface IWelcomeForm {
    /** The users first name */
    firstname: string;
    /** The users last name */
    lastname: string;
    /** The person who invited the user */
    inviter: string;
    /** Extra info about the user */
    info: string;
}
