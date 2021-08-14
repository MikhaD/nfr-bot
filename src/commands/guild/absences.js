const path = require("path");
const { MessageAttachment, Util, MessageEmbed } = require("discord.js");
const config = require(path.join(__dirname, "../../config.json"));
const { createErrorEmbed, fetchPlayer, fetchGuild, createStandardEmbed, createBannerImage } = require(path.join(__dirname, "../../utility/utility"));

module.exports = {
	name: "absences",
	aliases: ["abs"],
	args: {
		optional: ["guild", "min_days"]
	},
	description: "List players from a guild who have been absent for `min_days` number of days, Nefarious Ravens and 7 days by default.",
	example: "absences Nefarious Ravens 15",
	cooldown: 30,
	permissions: ["ADMINISTRATOR"],

	async execute(msg, args) {
		//i ######################################## Process arguments #######################################
		let guildName = config.default_guild;
		if (args.length > 0) {
			guildName = "";
			while (args.length) {
				if (isNaN(args[0])) {
					guildName += `${args.shift()} `;
				} else break;
			}
		}
		guildName = guildName.trim();
		const period = parseInt((args.length === 0) ? config.min_days : args[0]);

		//i #################################### Fetch absent players data ###################################
		const guild = await fetchGuild(guildName);
		if (guild.error) {
			if (guild.error === "Guild not found") {
				msg.channel.send({embeds: [createErrorEmbed(
					`Failed to retrieve data for ${guildName}`,
					"**Note:** Guild names are case sensitive. You also need to use the full name, not just the prefix (Nefarious Ravens not NFR)"
				)]});
			} else {
				msg.channel.send({embeds: [createErrorEmbed(`Failed to retrieve data for ${guildName}`, guild.error)]});
			}
			return;
		}
		//i Start fetching player data
		const AbsenteeData = getAbsenteeData(guild.members);
		const message = {};
		const embed = new MessageEmbed()
			.setTitle(`${guildName} Absences:`)
			.setColor(config.colors.embed.default);

		//i Generate guild banner and attach it as thumbnail if guild has a banner
		if (guild.banner) {
			const attachmentName = "rankImage.png";
			const attachment = new MessageAttachment(await createBannerImage(guild.banner), attachmentName);
			message.files = [attachment];
			embed.setThumbnail(`attachment://${attachmentName}`);
		}
		// once player data has been fetched
		AbsenteeData.then(data => {
			let absentees = 0;
			//i Sort absences by time absent
			data.absences = new Map([...data.absences.entries()].sort((a, b) => b[1] - a[1]));
			for (const i of data.absences) {
				if (i[1] >= period) {
					++absentees;
					embed.addField(Util.escapeItalic(i[0]), `${i[1]} days`);
				}
			}
			embed.setDescription(`The following ${absentees} people have been absent for ${period}+ days`);

			//! Failed players should have clock reaction to return to absences (if more than ~5 have failed it is likely the api has been pinged too many times)
			embed.setFooter(
				`${(Math.ceil(absentees / 25) > 1) ? "◀️Previous, ▶️Next, " : ""}📄Hide days${(data.failed.length) ? ", ❗Show failed" : ""}
				\npage 1 of ${Math.ceil(absentees / 25)}`);
			message.embeds = [embed];
			msg.channel.send(message);
		});
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