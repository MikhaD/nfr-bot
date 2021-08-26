const path = require("path");
const { MessageAttachment, Util, MessageEmbed } = require("discord.js");
const Embed = require("../../utility/Embed");
const config = require(path.join(__dirname, "../../config.json"));
const { createErrorEmbed, fetchPlayer, fetchGuild, createBannerImage } = require(path.join(__dirname, "../../utility/utility"));

module.exports = {
	name: "absences",
	description: "List players from a guild who have been absent for a given number of days",
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
		//i ######################################## Process arguments #######################################
		let guildName = interaction.options.getString("guild") || config.default_guild;
		guildName = guildName.trim();
		const days = interaction.options.getInteger("days") || config.min_days;

		//i #################################### Fetch absent players data ###################################
		const guild = await fetchGuild(guildName);
		if (guild.error) {
			if (guild.error === "Guild not found") {
				return await interaction.followUp({embeds: [createErrorEmbed(
					`Failed to retrieve data for ${guildName}`,
					"**Note:** Guild names are case sensitive. You also need to use the full name, not just the prefix (Nefarious Ravens not NFR)"
				)]});
			}
			return await interaction.followUp({embeds: [createErrorEmbed(`Failed to retrieve data for ${guildName}`, guild.error)]});
		}
		//i Start fetching player data
		let AbsenteeData = getAbsenteeData(guild.members);
		const embed = new Embed(`${guildName} Absences:`, "");

		//i Start generating guild banner if guild has a banner
		let banner = createBannerImage(guild.banner);

		AbsenteeData = await AbsenteeData;
		//i Add banner image to embed if guild has banner
		const message = embed.getMessageOptionsObject(true, true);
		banner = await banner;
		if (banner) {
			const attachmentName = "banner.png";
			const attachment = new MessageAttachment(banner, attachmentName);
			message.files = [attachment];
			embed.setThumbnail(`attachment://${attachmentName}`);
		}

		let absentees = 0;
		let absenteeNames = "";
		//i Sort absences by time absent
		AbsenteeData.absences = new Map([...AbsenteeData.absences.entries()].sort((a, b) => b[1] - a[1]));
		for (const i of AbsenteeData.absences) {
			if (i[1] >= days) {
				++absentees;
				embed.addField(Util.escapeItalic(i[0]), `${i[1]} days`);
				absenteeNames += `${Util.escapeItalic(i[0])}\n`;
			}
		}
		embed.addPage("Hide Times", new Embed(
			`${guildName} Absences:`,
			`The following ${absentees} people have been absent for ${days}+ days. Duration absent hidden for easy copying.\n\n**${absenteeNames}**`
		));
		embed.setDescription(`The following ${absentees} people have been absent for ${days}+ days`);

		if (AbsenteeData.failed.length) {
			const failedEmbed = new Embed(
				"Failed:",
				"Failed to fetch data for the following players. This is likely due to these players changing their names while in the guild."
			);
			embed.addPage("Failed", failedEmbed);
			failedEmbed.setColor(config.colors.embed.error);
			for (const i of AbsenteeData.failed) {
				failedEmbed.addField("\u200b", `[**${Util.escapeItalic(i)}**](https://namemc.com/search?q=${i} "See name history")`);
			}
		}
		//! Failed players should have clock reaction to return to absences (if more than ~5 have failed it is likely the api has been pinged too many times)
		embed.setFooter(
			`${(Math.ceil(absentees / 25) > 1) ? "◀️Previous, ▶️Next, " : ""}📄Hide days${(AbsenteeData.failed.length) ? ", ❗Show failed" : ""}
			\npage 1 of ${Math.ceil(absentees / 25)}`);

		const msg = await interaction.followUp(message);
		embed.setMessageObject(msg);
	}
};

/**
 * Return an object containing how long each member has been offline for
 * @param {object} members - The members object from a guild object from the Wynncraft API
 * @returns An object in the form {absences: Map, failed: Array} with absences containing key value
 * pairs of playerName: days absent, and failed containing a list of players who's data failed to get retrieved
 */
async function getAbsenteeData(members) {
	const promiseArray = [];
	let failed = 0;
	for (const member of members) {
		promiseArray.push(fetchPlayer(member.name));
	}
	console.log("waiting for player data promises to resolve");

	const result = { absences: new Map(), failed: [] };
	for (const player of await Promise.allSettled(promiseArray)) {
		try {
			result.absences.set(player.value.data[0].username, daysSince(player.value.data[0].meta.lastJoin));
		} catch {
			failed++;
			result.failed.push(player.value.kind.split("/")[2]);
			console.log(`Failed to retrieve data for ${player.value.kind.split("/")[2]}`);
		}
	}
	console.log(`retrieved data for ${promiseArray.length - failed} of ${promiseArray.length}`);
	return result;
}

/**
 * Find the number of days since a given time
 * @param {String} timeString - A time string in the format returned by the wynncraft API
 * @returns The rounded down number of days since a given time
 */
function daysSince(timeString) {
	const time = [];
	let previous = 0;
	for (const i in timeString) {
		if (isNaN(timeString[i])) {
			time.push(parseInt(timeString.substring(previous, i)));
			previous = parseInt(i) + 1;
		}
	}
	const milliseconds =
		new Date() - new Date(time[0], time[1] - 1, time[2], time[3], time[4], time[5], time[6]);
	//i 84 400 000 milliseconds per day
	return Math.floor(milliseconds / 86400000);
}