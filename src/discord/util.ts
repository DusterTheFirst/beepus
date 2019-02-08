/*!
 * Copyright (C) 2019  Zachary Kohnen
 */

import { Guild } from "discord.js";

/** Get a guild member from the given guild */
export function getGuildMember(x: string, guild: Guild) {
    let mems = guild.members;

    return mems.find(m =>
        m.user.username.toLowerCase() === x.toLowerCase()
        || m.displayName.toLowerCase() === x.toLowerCase()
        || m.user.tag.toLowerCase() === x.toLowerCase()
        || m.id.toLowerCase() === x.toLowerCase()
        || m.toString().toLowerCase() === x.toLowerCase());
}