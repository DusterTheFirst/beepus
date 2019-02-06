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
    /** The message sent */
    @Column()
    public message: string;
    /** User ID */
    @PrimaryColumn()
    public id: string;

    constructor(user: User, message: string) {
        this.user = user;
        this.message = message;
        this.id = user.id;
    }
}