const { readdirSync } = require("fs");
const path = require("path");
const Discord = require("discord.js");
const config = require(path.join(__dirname, "./config.json"));
const { createErrorEmbed, parsePermissions } = require(path.join(__dirname, "./utility/utility.js"));

const client = new Discord.Client({
	partials: ["MESSAGE", "REACTION", "CHANNEL"],
	intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MESSAGE_REACTIONS", "DIRECT_MESSAGES", "DIRECT_MESSAGE_REACTIONS"]
});
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

//i ############ get all slash commands from file and set them as properties of the client object ############
client.slashCommands = new Discord.Collection();
for (const dir of readdirSync(`${__dirname}/slashCommands`).filter(dir => /^[^_].*$/.test(dir))) {
	for (const file of readdirSync(`${__dirname}/slashCommands/${dir}`).filter(file => /^[^_].*\.js$/.test(file))) {
		const command = require(`./slashCommands/${dir}/${file}`);
		client.slashCommands.set(command.name, command);
	}
}

//i ############################################# On bot log in ##############################################
client.once("ready", async () => {
	client.user.setActivity(`${config.prefix}help`, { type: "PLAYING" });
	//! Register slash commands globally for release version
	// client.appCmdManager = client.application.commands;
	client.appCmdManager = client.guilds.cache.get("843909132359958618").commands;
	await client.appCmdManager.set(Array.from(client.slashCommands, el => el[1]));

	console.log(`${client.user.tag} has logged in.`);
});

//i ############################################# Handle commands ############################################
client.on("messageCreate", async (msg) => {
	if (msg.author.bot || !msg.content.startsWith(config.prefix)) return;
	let [cmd, ...args] = msg.content.slice(config.prefix.length).split(/\s+/);
	cmd = cmd.toLowerCase();

	const command = client.commands.get(cmd) || client.commands.find(i => i.aliases && i.aliases.includes(cmd)); //i get command & check aliases if not a command
	if (command) {
		if ((msg.channel.type === "dm" && command.serverOnly)) {
			msg.channel.send({embeds: [createErrorEmbed("Incorrect command context", `${command.name} can only be used in servers`)]});
			return;
		}
		//i check if user has permission to use that command
		if (command.permissions) {
			const needsDev = (command.permissions.includes("DEV") && msg.author.id !== config.developer_id);

			const authorPerms = msg.channel.permissionsFor(msg.author);
			if (!authorPerms || !authorPerms.has(command.permissions) || needsDev) {
				const errorEmbed = createErrorEmbed("Inadeqate Permissions", `You do not have adequate permissions to use \`${cmd}\` here.`);
				errorEmbed.addField(`${cmd} requires:`, parsePermissions(command.permissions));
				msg.channel.send({embeds: [errorEmbed]});
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
			msg.channel.sendTyping();
			await command.execute(msg, args);
		} catch (e) {
			console.log(e);
			msg.channel.send({embeds: [createErrorEmbed("Unable to execute command", `\`${e}\``)]});
		}
	} else {
		msg.client.commands.get("help").execute(msg, [cmd]);
	}
});

client.on("interactionCreate", async interaction => {
	//i Check its from a slash command as things like buttons and drop downs also create these events
	if (interaction.isCommand()) {
		try {
			const command = client.slashCommands.get(interaction.commandName);
			if (command) {
				//! Discord API currently doesn't allow setting of permissions for discord perms for slash commands, only roles. This means the commands will be visible to people who can't use them
				if (command.perms) {
					const authorPerms = interaction.channel.permissionsFor(interaction.member);
					if (!authorPerms || !authorPerms.has(command.perms)) {
						return interaction.reply({content: `⛔ ${parsePermissions(command.perms)} is required to use this command`, ephemeral: true});
					}
				}

				if (interaction.options.getBoolean("ephemeral")) {
					await interaction.deferReply({ ephemeral: true });
				} else {
					await interaction.deferReply(); // by deferring we have 15m to respond, but cannot use reply on the interaction, only followUp and editReply
				}
				await command.execute(interaction);
			}
		} catch (e) {
			console.log(e);
			const err = createErrorEmbed("Failed to execute command", e);
			await interaction.followUp({ embeds: [err], ephemeral: true });
		}
	}
});

//i ############################################ Bring bot online ############################################
//i load all env variables in .env file
require("dotenv").config();
//i log in
client.login(process.env.TOKEN);