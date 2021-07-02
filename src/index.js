const fs = require("fs");
const Discord = require("discord.js");
const config = require("./config.json");
const { createErrorEmbed } = require("./commands/utility/_utility");

const client = new Discord.Client({partials: ["MESSAGE", "REACTION"]});
client.cooldowns = new Discord.Collection();
const { cooldowns } = client;

//i ############ get all commands from file and set them as properties of the client object (bot) ############
client.commands = new Discord.Collection();
//match dirs that don't start with _
for (let dir of fs.readdirSync(`${__dirname}/commands`).filter(dir => /^[^_].*$/.test(dir))) {
	//match files that end in .js and don't start with _
	for (let file of fs.readdirSync(`${__dirname}/commands/${dir}`).filter(file => /^[^_].*\.js$/.test(file))) {
		let command = require(`./commands/${dir}/${file}`);
		client.commands.set(command.name, command);
	}
}

//i ########################## Send a message to console when the bot has logged in ##########################
client.once("ready", () => {
	console.log(`${client.user.tag} has logged in.`);
});

//i ############################################# Handle commands ############################################
client.on("message", async (msg) => {
	if (msg.author.bot || !msg.content.startsWith(config.prefix)) return;
	let [cmd, ...args] = msg.content.slice(config.prefix.length).split(/\s+/);
	cmd = cmd.toLowerCase();

	let command = client.commands.get(cmd) || client.commands.find(i => i.aliases && i.aliases.includes(cmd)); //i get command & check aliases if not a command
	if (command) {
		if ((msg.channel.type === "dm" && command.serverOnly)) {
			msg.channel.send(createErrorEmbed("Incorrect command context", `${command.name} can only be used in servers`));
			return;
		}

		//i cooldown
		if (!cooldowns.has(command.name)) {
			cooldowns.set(command.name, new Discord.Collection());
		}
		let now = Date.now();
		let timestamps = cooldowns.get(command.name);
		let cooldown = (command.cooldown || config.default_cooldown) * 1000;

		if (timestamps.has(msg.author.id)) {
			let expirationTime = timestamps.get(msg.author.id) + cooldown;
			if (now < expirationTime) return;
		}
		timestamps.set(msg.author.id, now);
		setTimeout(() => timestamps.delete(msg.author.id), cooldown);

		//i try to execute command
		try {
			msg.channel.startTyping();
			await command.execute(msg, args);
		} catch (e) {
			msg.channel.send(createErrorEmbed("Unable to execute command"), `Error:\n\`${e}\``);
		}
	} else {
		msg.channel.send(createErrorEmbed(
			`${config.prefix}${cmd} is not a recognised command`,
			`Try ${config.prefix}help for a list of commands`
		));
	}

	msg.channel.stopTyping();
});

//i ############################################ Bring bot online ############################################
// load all env variables in .env file
require("dotenv").config();
client.login(process.env.TOKEN);