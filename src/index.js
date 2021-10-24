const { readdirSync } = require("fs");
const path = require("path");
const Discord = require("discord.js");
const { ErrorEmbed } = require("./utility/Embed");
const config = require(path.join(__dirname, "./config.json"));
const { parsePermissions } = require(path.join(__dirname, "./utility/utility.js"));

const client = new Discord.Client({
	partials: ["MESSAGE", "REACTION", "CHANNEL"],
	intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MESSAGE_REACTIONS", "DIRECT_MESSAGES", "DIRECT_MESSAGE_REACTIONS"]
});
client.cooldowns = new Discord.Collection();
const { cooldowns } = client;

//info ########### get all slash commands from file and set them as properties of the client object ##########
client.commands = new Discord.Collection();
//match dirs that don't start with _
for (const dir of readdirSync(`${__dirname}/commands`).filter(dir => /^[^_].*$/.test(dir))) {
	//match files that end in .js and don't start with _
	for (const file of readdirSync(`${__dirname}/commands/${dir}`).filter(file => /^[^_].*\.js$/.test(file))) {
		const command = require(`./commands/${dir}/${file}`);
		command.category = dir;
		client.commands.set(command.name, command);
	}
}

//info ############################################ On bot log in ############################################
client.once("ready", async () => {
	client.user.setActivity(`${config.prefix}help`, { type: "PLAYING" });
	//! Register slash commands globally for release version
	// client.appCmdManager = client.application.commands;
	client.appCmdManager = client.guilds.cache.get(config.dev_guild_id).commands;
	await client.appCmdManager.set(Array.from(client.commands, el => el[1]));

	console.log(`${client.user.tag} has logged in.`);
});

//info ########################################### Handle commands ###########################################
client.on("messageCreate", async (msg) => {
	if (msg.author.bot || !msg.content.startsWith(config.prefix)) return;
	msg.reply({content: `${config.prefix} commands are depricated, use / instead. Do /help for help`, ephemeral: true});
});

client.on("interactionCreate", async interaction => {
	//info Check its from a slash command as things like buttons and drop downs also create these events
	if (interaction.isCommand()) {
		try {
			const command = client.commands.get(interaction.commandName);
			if (command) {
				//info check if user has permission to use that command
				//! Discord API currently doesn't allow setting of permissions for discord perms for slash commands, only roles. This means the commands will be visible to people who can't use them https://github.com/discord/discord-api-docs/discussions/3581
				if (command.dev && interaction.member.id !== config.developer_id) {
					return interaction.reply({ content: `⛔ /${command.name} is a developer command, you may not use it`, ephemeral: true });
				}
				if (command.perms) {
					const authorPerms = interaction.channel.permissionsFor(interaction.member);
					console.log(command.dev, interaction.member.id, config.developer_id);
					if (!authorPerms || !authorPerms.has(command.perms)) {
						return interaction.reply({ content: `⛔ ${parsePermissions(command.perms)} is required to use this command`, ephemeral: true });
					}
				}
				//info cooldown
				if (command.cooldown) {
					if (!cooldowns.has(command.name)) {
						cooldowns.set(command.name, new Discord.Collection());
					}
					const now = Date.now();
					const timestamps = cooldowns.get(command.name);
					const cooldown = command.cooldown * 1000;

					if (timestamps.has(interaction.member.id)) {
						const expirationTime = timestamps.get(interaction.member.id) + cooldown;
						if (now < expirationTime) {
							return interaction.reply({ content: `🕙 You can only use this command once every ${command.cooldown} seconds,\nyou have ${Math.round((expirationTime - now)/1000)} seconds until you can use it again`, ephemeral: true });
						}
					}
					timestamps.set(interaction.member.id, now);
					setTimeout(() => timestamps.delete(interaction.member.id), cooldown);
				}
				//info
				if (interaction.options.getBoolean("ephemeral") || command.ephemeral) {
					await interaction.deferReply({ ephemeral: true });
				} else {
					await interaction.deferReply(); // by deferring we have 15m to respond, but cannot use reply on the interaction, only followUp and editReply
				}
				await command.execute(interaction);
			}
		} catch (e) {
			console.log(e);
			const err = new ErrorEmbed("Failed to execute command", e);
			await interaction.followUp({ embeds: [err], ephemeral: true });
		}
	}
});

//info ########################################### Bring bot online ##########################################
//info load all env variables in .env file
require("dotenv").config();
//info log in
client.login(process.env.TOKEN);