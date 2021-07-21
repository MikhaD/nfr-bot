const { MessageEmbed } = require("discord.js");
const config = require("../../config.json");
const { createErrorEmbed, fetchPlayer, fetchGuild } = require("../../utility/_utility");

module.exports = {
	name: "absences",
	args: {
		optional: ["guild", "min days"]
	},
	description: "List players from a guild who have been absent for <min days> number of days, Nefarious Ravens and 7 days by default.",
	example: "absences Nefarious Ravens 15",
	cooldown: 10,
	permissions: ["ADMINISTRATOR"],

	async execute(msg, args) {
		//i ######################################## Process arguments #######################################
		let guild = config.default_guild;
		if (args.length > 0) {
			guild = "";
			while (args.length) {
				if (isNaN(args[0])) {
					guild += `${args.shift()} `;
				} else break;
			}
		}
		args.unshift(guild.trim());
		if (args.length === 1) {
			args.push(config.min_days);
		}
		args[1] = Number(args[1]);

		//i #################################### Fetch absent players data ###################################
		let data = await getAbsences(args[0]);
		if (data.error) {
			if (data.error === "Guild not found") {
				msg.channel.send(createErrorEmbed(
					`Failed to retrieve data for ${args[0]}`,
					"**Note:** Guild names are case sensitive. You also need to use the full name, not just the prefix (Nefarious Ravens not NFR)"));
			}
			return;
		}

		//i ########################################## Create embed ##########################################
		let absencesEmbed = new MessageEmbed()
			.setColor(config.colors.embed.default)
			.setTitle(`${args[0]} Absences:`)
			.attachFiles(["./src/images/banners/bannerTest.png"])
			.setThumbnail("attachment://bannerTest.png");

		let absentees = 0;
		//i Sort absences by time absent
		data.absences = new Map([...data.absences.entries()].sort((a, b) => b[1] - a[1]));
		for (let i of data.absences) {
			if (i[1] >= args[1]) {
				++absentees;
				absencesEmbed.addField(i[0], `${i[1]} days`);
			}
		}

		absencesEmbed.setDescription(`The following ${absentees} people have been absent for ${args[1]}+ days`);
		//! Failed players should have clock reaction to return to absences (if more than ~5 have failed it is likely the api has been pinged too many times)
		absencesEmbed.setFooter(
			`${(Math.ceil(absentees / 25) > 1) ? "◀️Previous, ▶️Next, " : ""}📄Hide days${(data.failed.length) ? ", ❗Show failed" : ""}
			\npage 1 of ${Math.ceil(absentees / 25)}`);
		msg.channel.send(absencesEmbed);
	}
};

async function getAbsences(guild) {
	// check if guild is in database and when it was put there
	// get guild info from api
	// get all the player names
	// query each player name & check last login
	// store info for this guild in database

	let guildJson = await fetchGuild(guild);
	if (guildJson.error) {
		return { error: guildJson.error };
	}
	let promiseArray = [];
	let failed = 0;
	for (let member of guildJson.members) {
		promiseArray.push(fetchPlayer(member.name));
	}
	console.log("waiting for player data promises to resolve");

	let result = { absences: new Map(), failed: [] };
	for (let player of await Promise.allSettled(promiseArray)) {
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
	let time = [];
	let previous = 0;
	for (let i in timeString) {
		if (isNaN(timeString[i])) {
			time.push(Number(timeString.substring(previous, i)));
			previous = Number(i) + 1;
		}
	}
	let milliseconds =
		new Date() -
		new Date(time[0], time[1] - 1, time[2], time[3], time[4], time[5], time[6]);
	//i 84 400 000 milliseconds per day
	return Math.floor(milliseconds / 86400000);
}