import { HexColorString, Message, Util } from "discord.js";
import Embed, { ErrorEmbed } from "../../utility/Embed.js";
import MessageObject from "../../utility/MessageObject.js";
import config from "../../config.js";
import { fetchPlayer, fetchGuild } from "../../utility/utility.js";
import { Command, WynnGuildObject, WynnGuildMember, WynnAPIPlayer } from "../../types";

export const command: Command = {
	name: "absences",
	description: "List players from a guild who have been absent for x number of days, Nefarious Ravens by default",
	cooldown: 30,
	ephemeral: false,
	perms: ["MANAGE_GUILD"],
	options: [{
		name: "guild",
		type: "STRING",
		// The name or prefix of the guild to check once I implement the prefix lookup table
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
		//info ###################################### Process arguments ######################################
		let guildName = interaction.options.getString("guild") || config.default_guild;
		guildName = guildName.trim();
		const days = interaction.options.getInteger("days") || config.min_days;

		//info ################################## Fetch absent players data ##################################
		const guild = await fetchGuild(guildName) as WynnGuildObject;
		if (guild.error) {
			if (guild.error === "Guild not found") {
				await interaction.followUp(new ErrorEmbed(
					`Failed to retrieve data for ${guildName}`,
					"**Note:** Guild names are case sensitive. You also need to use the full name, not just the prefix (Nefarious Ravens not NFR)"
				));
				return;
			}
			await interaction.followUp(new ErrorEmbed(`Failed to retrieve data for ${guildName}`, guild.error));
			return;
		}
		//info Fetch player data
		const AbsenteeData = await getAbsenteeData(guild.members);

		const embed = new Embed(`${guildName} Absences:`, "", true);
		//info Create message and add guild banner thumbnail
		const message = new MessageObject();
		message.setThumbnail(`${config.guildBannerUrl}${guildName.replaceAll(" ", "%20")}`);

		let absentees = 0;
		let absenteeNames = "";
		//info Sort absences by time absent
		AbsenteeData.absences = new Map([...AbsenteeData.absences.entries()].sort((a, b) => b[1] - a[1]));
		for (const i of AbsenteeData.absences) {
			if (i[1] >= days) {
				++absentees;
				embed.addField(Util.escapeItalic(i[0]), `${i[1]} days`);
				absenteeNames += `${Util.escapeItalic(i[0])}\n`;
			}
		}
		embed.setDescription(`The following ${absentees} people have been absent for ${days}+ days`);

		message.addPage(embed);
		message.addPage(new Embed(
			"Absences Copy List:",
			`The following ${absentees} people have been absent for ${days}+ days.\nDuration absent hidden for easy copying.\n\n**${absenteeNames}**`
		));

		if (AbsenteeData.failed.length) {
			const failedEmbed = new Embed(
				"Failed:",
				"Failed to fetch data for the following players. This is likely due to these players changing their names while in the guild."
			);
			failedEmbed.setColor(config.colors.embed.error as HexColorString);
			for (const i of AbsenteeData.failed) {
				failedEmbed.addField("\u200b", `[**${Util.escapeItalic(i)}**](https://namemc.com/search?q=${i} "See name history")`);
			}
			message.addPage(failedEmbed);
		}
		const msg = await interaction.followUp(message);
		message.watchMessage(msg as Message);
	},
};

/**
 * Return an object containing how long each member has been offline for
 * @param members - The members object from a guild object from the Wynncraft API
 * @returns An object in the form {absences: Map, failed: Array} with absences containing key value
 * pairs of playerName: days absent, and failed containing a list of players who's data failed to get retrieved
 */
async function getAbsenteeData(members: WynnGuildMember[]) {
	const promiseArray = [];
	let failed = 0;
	for (const member of members) {
		promiseArray.push(fetchPlayer(member.name));
	}
	console.log("waiting for player data promises to resolve");

	const result = { absences: new Map<string, number>(), failed: new Array<string>() };
	for (const player of await Promise.allSettled(promiseArray)) {
		if (fulfilled(player)) {
			try {
				result.absences.set(player.value.data[0].username, daysSince(player.value.data[0].meta.lastJoin));
			} catch {
				failed++;
				result.failed.push(player.value.kind.split("/")[2]);
				console.log(`Failed to retrieve data for ${player.value.kind.split("/")[2]}`);
			}
		}
	}
	console.log(`retrieved data for ${promiseArray.length - failed} of ${promiseArray.length}`);
	return result;
}

/**
 * Find the number of days since a given time
 * @param timeString - A time string in the format returned by the wynncraft API
 * @returns The rounded down number of days since a given time
 */
function daysSince(timeString: string) {
	const time = [];
	let previous = 0;
	for (let i = 0; i < timeString.length; ++i) {
		if (isNaN(Number(timeString[i]))) {
			time.push(parseInt(timeString.substring(previous, i)));
			previous = i + 1;
		}
	}
	const milliseconds =
		new Date().valueOf() - new Date(time[0], time[1] - 1, time[2], time[3], time[4], time[5], time[6]).valueOf();
	//info 84 400 000 milliseconds per day
	return Math.floor(milliseconds / 86400000);
}

function fulfilled(result: PromiseSettledResult<unknown>): result is PromiseFulfilledResult<WynnAPIPlayer> {
	return (result as PromiseFulfilledResult<WynnAPIPlayer>).value !== undefined;
}