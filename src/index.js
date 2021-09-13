global.path = __dirname;

const { readdirSync } = require("fs");
const path = require("path");
const Discord = require("discord.js");
const config = require(path.join(__dirname, "./config.json"));
const { createErrorEmbed, parsePermissions } = require(path.join(__dirname, "./utility/_utility.js"));

const client = new Discord.Client({partials: ["MESSAGE", "REACTION"]});
client.cooldowns = new Discord.Collection();
const { cooldowns } = client;

//i ############ get all commands from file and set them as properties of the client object (bot) ############
client.commands = new Discord.Collection();
//match dirs that don't start with _
for (const dir of readdirSync(`${__dirname}/commands`).filter(dir => /^[^_].*$/.test(dir))) {
	//match files that end in .js and don't start with _
	for (const file of readdirSync(`${__dirname}/commands/${dir}`).filter(file => /^[^_].*\.js$/.test(file))) {
		const command = require(`./commands/${dir}/${file}`);
		client.commands.set(command.name, command);
	}
}

//i ########################## Send a message to console when the bot has logged in ##########################
client.once("ready", () => {
	client.user.setActivity(`${config.prefix}help`, { type: "PLAYING" });
	console.log(`${client.user.tag} has logged in.`);
});

//i ############################################# Handle commands ############################################
client.on("message", async (msg) => {
	if (msg.author.bot || !msg.content.startsWith(config.prefix)) return;
	let [cmd, ...args] = msg.content.slice(config.prefix.length).split(/\s+/);
	cmd = cmd.toLowerCase();

	const command = client.commands.get(cmd) || client.commands.find(i => i.aliases && i.aliases.includes(cmd)); //i get command & check aliases if not a command
	if (command) {
		if ((msg.channel.type === "dm" && command.serverOnly)) {
			msg.channel.send(createErrorEmbed("Incorrect command context", `${command.name} can only be used in servers`));
			return;
		}
		//i check if user has permission to use that command
		if (command.permissions) {
			const authorPerms = msg.channel.permissionsFor(msg.author);
			if (!authorPerms || !authorPerms.has(command.permissions)) {
				const errorEmbed = createErrorEmbed("Inadeqate Permissions", `You do not have adequate permissions to use \`${cmd}\` here.`);
				errorEmbed.addField(`${cmd} requires:`, parsePermissions(command.permissions));
				msg.channel.send(errorEmbed);
				return;
			}
		}

		//i cooldown
		if (!cooldowns.has(command.name)) {
			cooldowns.set(command.name, new Discord.Collection());
		}
		const now = Date.now();
		const timestamps = cooldowns.get(command.name);
		const cooldown = (command.cooldown || config.default_cooldown) * 1000;

		if (timestamps.has(msg.author.id)) {
			const expirationTime = timestamps.get(msg.author.id) + cooldown;
			if (now < expirationTime) return;
		}
		timestamps.set(msg.author.id, now);
		setTimeout(() => timestamps.delete(msg.author.id), cooldown);

		//i ensure commands with required arguments have at least that many arguments
		if (command.args.required && command.args.required.length > args.length) {
			client.commands.get("help").execute(msg, [cmd]);
			return;
		}

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
//i load all env variables in .env file
require("dotenv").config();
//i log in
client.login(process.env.TOKEN);