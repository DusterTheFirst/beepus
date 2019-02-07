/*!
 * Copyright (C) 2019  Zachary Kohnen
 */

// import { GuildMember, RichEmbed } from "discord.js";
// import moment from "moment";
// import config from "../config/config.json";
// import generateForm from "../web/generateForm.js";

// /** The flow to run when a user joins */
// export async function welcomeFlow(member: GuildMember) {
//     // Auto assign roles
//     // TODO: WAIT TILL HALL PASS
//     // member.addRoles(config.roles.autoAssign);

//     // Genertate a JWT with user info for intro
//     let form = generateForm(member.user);

//     // Welcome them to the server
//     await member.send(new RichEmbed({
//         color: member.guild.me.displayColor,
//         description: `
//             Welcome to the server!
//             To receive your hall pass, please complete [**this form**](${form.url}) within the following ${config.expires}.
//             **DO NOT** and I repeat **DO NOT** share this url with anyone for they will be able to submit the form on your behalf.

//             Thank you!
//         `,
//         fields: [
//             {
//                 inline: true,
//                 name: "Created At",
//                 value: moment(form.created).format("hh:mm a")
//             },
//             {
//                 inline: true,
//                 name: "Expires At",
//                 value: moment(form.expires).format("hh:mm a")
//             }
//         ],
//         footer: {
//             icon_url: member.guild.me.user.displayAvatarURL,
//             text: member.guild.me.user.tag
//         },
//         thumbnail: {
//             url: member.guild.iconURL
//         },
//         title: "Hello there!"
//     }));
// }