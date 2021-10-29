"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const discord_js_1 = require("discord.js");
const Embed_1 = __importStar(require("../../utility/Embed"));
const MessageObject_1 = __importDefault(require("../../utility/MessageObject"));
const config_json_1 = __importDefault(require("../../config.json"));
const utility_1 = require("../../utility/utility");
exports.command = {
    name: "absences",
    description: "List players from a guild who have been absent for x number of days, Nefarious Ravens by default",
    cooldown: 30,
    ephemeral: false,
    perms: ["MANAGE_GUILD"],
    options: [{
            name: "guild",
            type: "STRING",
            description: "The name of the guild to check",
            required: false
        },
        {
            name: "days",
            type: "INTEGER",
            description: "The minimum number of days absent",
            required: false
        }],
    async execute(interaction) {
        let guildName = interaction.options.getString("guild") || config_json_1.default.default_guild;
        guildName = guildName.trim();
        const days = interaction.options.getInteger("days") || config_json_1.default.min_days;
        const guild = await (0, utility_1.fetchGuild)(guildName);
        if (guild.error) {
            if (guild.error === "Guild not found") {
                await interaction.followUp(new Embed_1.ErrorEmbed(`Failed to retrieve data for ${guildName}`, "**Note:** Guild names are case sensitive. You also need to use the full name, not just the prefix (Nefarious Ravens not NFR)"));
                return;
            }
            await interaction.followUp(new Embed_1.ErrorEmbed(`Failed to retrieve data for ${guildName}`, guild.error));
            return;
        }
        const AbsenteeData = await getAbsenteeData(guild.members);
        const embed = new Embed_1.default(`${guildName} Absences:`, "", true);
        const message = new MessageObject_1.default();
        message.setThumbnail(`${config_json_1.default.guildBannerUrl}${guildName.replaceAll(" ", "%20")}`);
        let absentees = 0;
        let absenteeNames = "";
        AbsenteeData.absences = new Map([...AbsenteeData.absences.entries()].sort((a, b) => b[1] - a[1]));
        for (const i of AbsenteeData.absences) {
            if (i[1] >= days) {
                ++absentees;
                embed.addField(discord_js_1.Util.escapeItalic(i[0]), `${i[1]} days`);
                absenteeNames += `${discord_js_1.Util.escapeItalic(i[0])}\n`;
            }
        }
        embed.setDescription(`The following ${absentees} people have been absent for ${days}+ days`);
        message.addPage(embed);
        message.addPage(new Embed_1.default("Absences Copy List:", `The following ${absentees} people have been absent for ${days}+ days.\nDuration absent hidden for easy copying.\n\n**${absenteeNames}**`));
        if (AbsenteeData.failed.length) {
            const failedEmbed = new Embed_1.default("Failed:", "Failed to fetch data for the following players. This is likely due to these players changing their names while in the guild.");
            failedEmbed.setColor(config_json_1.default.colors.embed.error);
            for (const i of AbsenteeData.failed) {
                failedEmbed.addField("\u200b", `[**${discord_js_1.Util.escapeItalic(i)}**](https://namemc.com/search?q=${i} "See name history")`);
            }
            message.addPage(failedEmbed);
        }
        const msg = await interaction.followUp(message);
        message.watchMessage(msg);
    },
};
async function getAbsenteeData(members) {
    const promiseArray = [];
    let failed = 0;
    for (const member of members) {
        promiseArray.push((0, utility_1.fetchPlayer)(member.name));
    }
    console.log("waiting for player data promises to resolve");
    const result = { absences: new Map(), failed: new Array() };
    for (const player of await Promise.allSettled(promiseArray)) {
        if (fulfilled(player)) {
            try {
                result.absences.set(player.value.data[0].username, daysSince(player.value.data[0].meta.lastJoin));
            }
            catch {
                failed++;
                result.failed.push(player.value.kind.split("/")[2]);
                console.log(`Failed to retrieve data for ${player.value.kind.split("/")[2]}`);
            }
        }
    }
    console.log(`retrieved data for ${promiseArray.length - failed} of ${promiseArray.length}`);
    return result;
}
function daysSince(timeString) {
    const time = [];
    let previous = 0;
    for (let i = 0; i < timeString.length; ++i) {
        if (isNaN(Number(timeString[i]))) {
            time.push(parseInt(timeString.substring(previous, i)));
            previous = i + 1;
        }
    }
    const milliseconds = new Date().valueOf() - new Date(time[0], time[1] - 1, time[2], time[3], time[4], time[5], time[6]).valueOf();
    return Math.floor(milliseconds / 86400000);
}
function fulfilled(result) {
    return result.value !== undefined;
}
