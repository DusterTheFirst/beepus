/*!
 * Copyright (C) 2019  Zachary Kohnen
 */

import { Column, Entity, PrimaryColumn } from "typeorm";
import RealUser from "./RealUser";

@Entity()
export default class Submission {
    /** The user tied to the submission */
    @Column(() => RealUser)
    public user: RealUser;
    /** The message sent */
    @Column()
    public message: string;
    /** User ID */
    @PrimaryColumn()
    public id: string;

    constructor(user?: RealUser, message?: string) {
        if (user !== undefined) {
            this.user = user;
            this.id = user.id;
        }
        if (message !== undefined) {
            this.message = message;
        }
    }
}