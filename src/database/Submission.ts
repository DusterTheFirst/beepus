/*!
 * Copyright (C) 2019  Zachary Kohnen
 */

import { Column, Entity } from "typeorm";
import RealUser from "./RealUser";

@Entity()
export default class Submission {
    /** The user tied to the submission */
    @Column(() => RealUser)
    public user: RealUser;
    /** The message sent */
    @Column()
    public message: string;

    constructor(user: RealUser, message: string) {
        this.user = user;
        this.message = message;
    }
}