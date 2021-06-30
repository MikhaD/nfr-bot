// load all env variables in .env file
require("dotenv").config();

const Discord = require("discord.js");
const fetch = require("node-fetch");
const config = require("./config.json");
const helpFile = require("./help.json");

const bot = new Discord.Client({
	partials: ["MESSAGE", "REACTION"]
});

bot.once("ready", () => {
	console.log(`${bot.user.tag} has logged in.`);
});

bot.on("message", async (msg) => {
	if (msg.author.bot || !msg.content.startsWith(config.prefix)) return;
	let [command, ...args] = msg.content.slice(config.prefix.length).split(/\s+/);
	for (let i in args) {
		args[i] = args[i].toLowerCase();
	}
	switch (command.toLowerCase()) {
	case "absences": {
		msg.channel.startTyping();
		//i args: Guild, min days, show days
		args = setArgs([config.guild, config.min_days, true], args);
		let absencesEmbed = new Discord.MessageEmbed()
			.setColor(config.embed.colors.default)
			.setTitle(`${args[0]} Absences:`)
			.setDescription(`The following people have been absent for ${args[1]}+ days`)
			.setFooter(`◀️Previous, ▶️Next, 📄Hide days, 🕙Show days\n\npage 1 of ${1}`); //! change this to reflect the actual values

		let tempMessage = `${args[0]} Absences:\n`;
		getAbsences(args[0]).then(absences => {
			for (let member of Object.keys(absences)) {
				if (absences[member] >= args[1]) {
					absencesEmbed.addField(member, `${absences[member]} days`);
					// tempMessage = tempMessage + `**${member}**\n${absences[member]} days\n`;
				}
			}
			// msg.channel.send(tempMessage);
			msg.channel.send(absencesEmbed);
		});
		break;
	}
	case "flip": {
		msg.channel.send((Math.random() > 0.5) ? "heads" : "tails");
		break;
	}
	case "purge": {
		purge(msg, args);
		break;
	}
	case "help": {
		if (args.length > 0) {
			let helpObj = helpForCommand(args[0]);
			if (helpObj === null) {
				msg.channel.send(createErrorEmbed(`${config.prefix}${args[0]} is not a valid command`, `Type \`${config.prefix}help\` to see the list of commands.`));
			} else {
				let embed = createSimpleEmbed(`${config.prefix}${args[0]}${helpObj.parameters}`, helpObj.description);
				embed.addField("Example:", helpObj.example);
				msg.channel.send(embed);
			}
		} else {
			// just loop through them all for now, put them in categories once I have more commands
			let helpObj = helpForCommand("help");
			let helpEmbed = new Discord.MessageEmbed()
				.setTitle("Command Help")
				.setDescription(`Call ${config.prefix}help on a specific command to see an example.`)
				.setColor(config.embed.colors.default)
				.addField(`${config.prefix}help${helpObj.parameters}`, helpObj.description)
				// .setFooter(`\n◀️Previous, ▶️Next\n\npage 1 of ${1}`); //! change this to reflect the actual values
				.setFooter("\n\npage 1 of 1");
			for (let cmd of Object.keys(helpFile)) {
				if (cmd !== "help"){
					helpObj = helpForCommand(cmd);
					helpEmbed.addField(`${config.prefix}${cmd}${helpObj.parameters}`, helpObj.description);
				}
			}
			msg.channel.send(helpEmbed);
		}
		break;
	}

	default: {
		msg.channel.send(`${command} is not a recognised command`);
		break;
	}
	}
	msg.channel.stopTyping();
});

bot.login(process.env.TOKEN);

/**
 * If an argument is boolean it can be either 1/0 or true/false (case insensitive)
 * If the bool is in the array array it must be true/false
 */
function setArgs(defaultsArray, args) {
	let result = [];
	for (let i in defaultsArray) {
		if (args.length >= i + 1) {
			// Standardize boolean values
			args[i] = ["1", "true"].indexOf(args[i] > 0) ? true : args[i];
			args[i] = ["0", "false"].indexOf(args[i] > 0) ? false : args[i];
			result.push(args[i]);
		} else {
			result.push(defaultsArray[i]);
		}
	}
	return result;
}

async function getAbsences(guild) {
	// check if guild is in database and when it was put there
	// get guild info from api
	// get all the player names
	// query each player name & check last login
	// store info for this guild in database

	let guildJson = await fetchGuild(guild);
	let promiseArray = [];
	let failed = 0;
	for (let member of guildJson.members) {
		promiseArray.push(fetchPlayer(member.name));
	}
	console.log("waiting for player data promises");

	let absences = {};
	for (let player of await Promise.allSettled(promiseArray)) {
		try {
			absences[player.value.data[0].username] = daysSince(
				player.value.data[0].meta.lastJoin
			);
		} catch {
			failed++;
			console.log(`Failed to retrieve data for ${player.value.kind.split("/")[2]}`);
		}
	}
	console.log(`retrieved data for ${promiseArray.length-failed} of ${promiseArray.length}`);
	return absences;
}

async function fetchGuild(name) {
	let guildData = await fetch(
		`https://api.wynncraft.com/public_api.php?action=guildStats&command=${name}`
	);
	return await guildData.json();
}

async function fetchPlayer(name) {
	let playerData = await fetch(
		`https://api.wynncraft.com/v2/player/${name}/stats`
	);
	return await playerData.json();
}

async function fetchPlayers(namesArray) {
	let promiseArray = [];
	for (let name of namesArray) {
		promiseArray.push(fetchPlayer(name));
	}
	return Promise.allSettled(promiseArray);
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

async function purge(msg, args) {
	if (args.length >= 1 && !isNaN(args[0])) {
		//i +1 one to also delete the message with the purge command
		let messages = Math.round(parseInt(args[0])) + 1;
		if (messages < 2) {
			msg.channel.send(createErrorEmbed("Invalid number of messages", "You must purge at least 1 or more messages."));
			return;
		}

		let hundreds = Math.floor(messages / 100);
		let remainder = messages % 100;

		let totalDeleted = 0;

		if (remainder > 0) {
			let e = await msg.channel.bulkDelete(remainder, true);
			totalDeleted += e.size;
		}
		for (let i = 0; i < hundreds; ++i) {
			let e = await msg.channel.bulkDelete(100, true);
			totalDeleted += e.size;
		}

		if ((args.length < 2 || args[1] !== "true") && totalDeleted === messages) {
			let successEmbed = new Discord.MessageEmbed()
				.setColor(config.embed.colors.success)
				.setTitle(`${messages -1} message${(messages !== 2) ? "s": ""} deleted from #${msg.channel.name}`)
				.setDescription(`Use \`${config.prefix}purge <number of messages> true\` to not show this message`);

			msg.channel.send(successEmbed);
		} else if (totalDeleted !== messages) {
			msg.channel.send(
				createWarnEmbed(`${totalDeleted - 1} of ${messages - 1} messages deleted`, "Messages over 2 weeks old are unable to be deleted"));
		}
	} else {
		msg.channel.send(
			createErrorEmbed("Invalid command syntax", `The syntax for purge is:\n\`${config.prefix}purge <integer >= 1> [<hide completed message boolean>] \``));
	}
}


function helpForCommand(command) {
	if (command in helpFile) {
		let result = {};
		result["description"] = helpFile[command].description;
		result["example"] = `${config.prefix}${helpFile[command].example}`;
		result["parameters"] = "";

		if ("parameters" in helpFile[command]) {
			if ("required" in helpFile[command].parameters) {
				for (let i of helpFile[command].parameters.required) {
					result["parameters"] += ` <${i}>`;
				}
			}
			if ("optional" in helpFile[command].parameters) {
				result["parameters"] += " [";
				for (let i of helpFile[command].parameters.optional) {
					result["parameters"] += `${i}, `;
				}
				result["parameters"] = result["parameters"].slice(0, -2) + "]";
			}
		}
		return result;
	} else return null;
}

/**
 * Create a standard simple embed (default highlight)
 * @param {string} title - The embed's title
 * @param {string} text - The embed's text
 * @returns a Discord.MessageEmbed object
 */
function createSimpleEmbed(title, text) {
	return new Discord.MessageEmbed()
		.setTitle(title)
		.setDescription(text)
		.setColor(config.embed.colors.default);
}

/**
 * Create a standard warning embed (orange highlight)
 * @param {string} title - The embed's title
 * @param {string} text - The embed's text
 * @returns a Discord.MessageEmbed object
 */
function createWarnEmbed(title, text) {
	return new Discord.MessageEmbed()
		.setTitle(title)
		.setDescription(text)
		.setColor(config.embed.colors.warn);
}

/**
 * Create a standard error embed (red highlight)
 * @param {string} title - The embed's title
 * @param {string} text - The embed's text
 * @returns a Discord.MessageEmbed object
 */
function createErrorEmbed(title, text) {
	return new Discord.MessageEmbed()
		.setTitle(title)
		.setDescription(text)
		.setColor(config.embed.colors.error);
}