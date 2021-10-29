"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const utility_1 = require("../../utility/utility");
const config_json_1 = __importDefault(require("../../config.json"));
const discord_js_1 = require("discord.js");
const Embed_1 = require("../../utility/Embed");
exports.command = {
    name: "stats",
    description: "Show the statistics of a given player, list by default",
    cooldown: 5,
    ephemeral: false,
    perms: [],
    options: [{
            name: "name",
            type: "STRING",
            description: "Player's name",
            required: true
        },
        {
            name: "formatted",
            type: "BOOLEAN",
            description: "Whether the stats are formatted (instead of a list)",
            required: false
        }],
    async execute(interaction) {
        const name = interaction.options.getString("name");
        const formatted = interaction.options.getBoolean("formatted");
        const { code, data } = await (0, utility_1.fetchPlayer)(name);
        try {
            const player = data[0];
            const message = {
                embeds: new Array(),
                files: new Array()
            };
            const embed = new discord_js_1.MessageEmbed();
            message.embeds.push(embed);
            embed.setColor((player.rank === "Player" ? config_json_1.default.colors.tag[player.meta.tag.value || "null"] : config_json_1.default.colors.rank[player.rank]));
            const forumDataPromise = (0, utility_1.fetchForumData)(player.username);
            if (formatted) {
                embed.setTitle(`Player Stats for ${player.username}`);
                embed.setURL(`https://wynncraft.com/stats/player/${player.username}`);
                embed.setDescription((player.guild.name !== null) ? `${(0, utility_1.toTitleCase)(player.guild.rank || "")} of **${player.guild.name}**` : "*Not part of a guild*");
                const attachmentName = "rankImage.png";
                const imgBuffer = (0, utility_1.createRankImage)(player.uuid, player.meta.tag.value);
                if (player.meta.location.online) {
                    embed.addField("Status:", "🟢 Online", true);
                    embed.addField("Current World:", player.meta.location.server, true);
                }
                else {
                    embed.addField("Status:", "🔴 Offline", true);
                    embed.addField("Last Seen:", (0, utility_1.makeDateFriendly)(player.meta.lastJoin), true);
                }
                embed.addField("First Joined:", (0, utility_1.makeDateFriendly)(player.meta.firstJoin), true);
                embed.addField("\u200b", "\u200b");
                embed.addField("Total Level:", (0, utility_1.spaceNumber)(player.global.totalLevel.combined), true);
                embed.addField("Combat Total:", (0, utility_1.spaceNumber)(player.global.totalLevel.combat), true);
                embed.addField("Profession Total:", (0, utility_1.spaceNumber)(player.global.totalLevel.profession), true);
                embed.addField("\u200b", "\u200b");
                embed.addField("Playtime:", (0, utility_1.asHours)(Math.floor(player.meta.playtime * 4.7)), true);
                embed.addField("Logins:", (0, utility_1.spaceNumber)(player.global.logins), true);
                embed.addField("Deaths:", (0, utility_1.spaceNumber)(player.global.deaths), true);
                embed.addField("\u200b", "\u200b");
                embed.addField("Chests Opened:", (0, utility_1.spaceNumber)(player.global.chestsFound), true);
                embed.addField("Mobs Killed:", (0, utility_1.spaceNumber)(player.global.mobsKilled), true);
                embed.addField("Distance Traveled:", (0, utility_1.asDistance)(player.global.blocksWalked), true);
                const img = await imgBuffer;
                if (img !== null) {
                    const attachment = new discord_js_1.MessageAttachment(img, attachmentName);
                    message.files.push(attachment);
                    embed.setThumbnail(`attachment://${attachmentName}`);
                }
            }
            else {
                const attachmentName = "face.png";
                const imgBuffer = (0, utility_1.fetchPlayerFace)(player.uuid);
                const width = 35;
                let str = "```ml\n";
                str += (0, utility_1.spaceBetween)("Joined:", `${(0, utility_1.makeDateFriendly)(player.meta.firstJoin)}`, width) + "\n";
                if (player.meta.location.online) {
                    str += (0, utility_1.spaceBetween)("Current World:", player.meta.location.server, width) + "\n";
                }
                else {
                    str += (0, utility_1.spaceBetween)("Last Seen:", `${(0, utility_1.makeDateFriendly)(player.meta.lastJoin)}`, width) + "\n";
                }
                str += (0, utility_1.spaceBetween)("Rank:", (player.meta.tag.value !== null) ? player.meta.tag.value : "Player", width) + "\n\n";
                const guildStatus = (player.guild.name !== null) ? `${(0, utility_1.toTitleCase)(player.guild.rank || "")} of ${player.guild.name}` : "no guild";
                str += " ".repeat((width - guildStatus.length) / 2) + guildStatus + " ".repeat((width - guildStatus.length) / 2) + "\n\n";
                str += " ".repeat((width - 20) / 2) + "---- Statistics ----" + " ".repeat((width - 20) / 2) + "\n\n";
                str += (0, utility_1.spaceBetween)("Total Level:", (0, utility_1.spaceNumber)(player.global.totalLevel.combined), width) + "\n";
                str += (0, utility_1.spaceBetween)("Combat Total:", (0, utility_1.spaceNumber)(player.global.totalLevel.combat), width) + "\n";
                str += (0, utility_1.spaceBetween)("Profession Total:", (0, utility_1.spaceNumber)(player.global.totalLevel.profession), width) + "\n";
                str += (0, utility_1.spaceBetween)("Playtime:", (0, utility_1.asHours)(Math.floor(player.meta.playtime * 4.7)), width) + "\n";
                str += (0, utility_1.spaceBetween)("Logins:", (0, utility_1.spaceNumber)(player.global.logins), width) + "\n";
                str += (0, utility_1.spaceBetween)("Deaths:", (0, utility_1.spaceNumber)(player.global.deaths), width) + "\n";
                str += (0, utility_1.spaceBetween)("Chests Opened:", (0, utility_1.spaceNumber)(player.global.chestsFound), width) + "\n";
                str += (0, utility_1.spaceBetween)("Mobs Killed:", (0, utility_1.spaceNumber)(player.global.mobsKilled), width) + "\n";
                str += (0, utility_1.spaceBetween)("Distance Traveled:", (0, utility_1.asDistance)(player.global.blocksWalked), width) + "\n";
                str += "```";
                embed.setDescription(str);
                const img = await imgBuffer;
                if (img !== null) {
                    const attachment = new discord_js_1.MessageAttachment(img, attachmentName);
                    message.files = [attachment];
                }
                embed.setAuthor(`Player Stats for ${player.username}`, `attachment://${attachmentName}`, `https://wynncraft.com/stats/player/${player.username}`);
            }
            const forumData = await forumDataPromise;
            if (forumData !== null) {
                embed.addField("\u200b", `[Forum page](https://forums.wynncraft.com/members/${forumData.id}) (${forumData.username})`);
            }
            await interaction.followUp(message);
        }
        catch (e) {
            await interaction.followUp(new Embed_1.ErrorEmbed(`Failed to retrieve player stats for ${name}`));
            console.log(`Error code: ${code}`);
            console.log(e);
        }
    }
};
