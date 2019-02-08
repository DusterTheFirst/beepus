/*!
 * Copyright (C) 2019  Zachary Kohnen
 */

import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export default class RealUser {
    /** The discord ID of the user */
    @PrimaryColumn()
    public id: string;
    /** The users first name */
    @Column()
    public firstname: string;
    /** The users last name */
    @Column()
    public lastname: string;
    /** The person who invited the user */
    @Column()
    public inviter: string;
    /** Extra info about the user */
    @Column()
    public info?: string;

    constructor(id: string, firstname: string, lastname: string, inviter: string, info?: string) {
        this.id = id;
        this.firstname = firstname;
        this.lastname = lastname;
        this.inviter = inviter;
        this.info = info;
    }
}