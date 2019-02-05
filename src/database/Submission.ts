/*!
 * Copyright (C) 2019  Zachary Kohnen
 */

import { Column, Entity, PrimaryColumn } from "typeorm";
import User from "./User";

@Entity()
export default class Submission {
    /** The user tied to the submission */
    @Column(() => User)
    public user: User;
    /** The message */
    @PrimaryColumn()
    public message: string;

    constructor(user: User, message: string) {
        this.user = user;
        this.message = message;
    }
}