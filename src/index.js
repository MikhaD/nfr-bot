// load all env variables in .env file
require("dotenv").config();

const fs = require("fs");
const Discord = require("discord.js");
const config = require("./config.json");
const { createErrorEmbed } = require("./commands/utility/_utility");

const bot = new Discord.Client({partials: ["MESSAGE", "REACTION"]});
bot.cooldowns = new Discord.Collection();

//i ############ get all commands from file and set them as properties of the client object (bot) ############
bot.commands = new Discord.Collection();
//match dirs that don't start with _
for (let dir of fs.readdirSync(`${__dirname}/commands`).filter(dir => /^[^_].*$/.test(dir))) {
	//match files that end in .js and don't start with _
	for (let file of fs.readdirSync(`${__dirname}/commands/${dir}`).filter(file => /^[^_].*\.js$/.test(file))) {
		let command = require(`./commands/${dir}/${file}`);
		bot.commands.set(command.name, command);
	}
}

//i ########################## Send a message to console when the bot has logged in ##########################
bot.once("ready", () => {
	console.log(`${bot.user.tag} has logged in.`);
});

//i ############################################# Handle commands ############################################
bot.on("message", async (msg) => {
	if (msg.author.bot || !msg.content.startsWith(config.prefix)) return;
	let [cmd, ...args] = msg.content.slice(config.prefix.length).split(/\s+/);
	cmd = cmd.toLowerCase();

	if (bot.commands.has(cmd)) {
		let command = bot.commands.get(cmd);
		if ((msg.channel.type === "dm" && command.serverOnly)) {
			msg.channel.send(createErrorEmbed("Incorrect command context", `${command.name} can only be used in servers`));
			return;
		}

		try {
			await command.execute(msg, args);
		} catch (e) {
			msg.channel.send(createErrorEmbed("Unable to execute command"), `Error:\n\`${e}\``);
		}
	} else {
		msg.channel.send(`${cmd} is not a recognised command`);
	}

	msg.channel.stopTyping();
});

//i ############################################ Bring bot online ############################################
bot.login(process.env.TOKEN);