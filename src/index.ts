import { Command, CommandOptionChoice, customClient } from "./types";
import { readdirSync } from "fs";
import { Client, GuildMember } from "discord.js";
import { parsePermissions } from "./utility/utility.js";
import { ErrorEmbed } from "./utility/Embed.js";
import config from "./config.js";

import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL(".", import.meta.url))

//   _____                _         _____ _ _            _   
//  /  __ \              | |       /  __ \ (_)          | |  
//  | /  \/_ __ ___  __ _| |_ ___  | /  \/ |_  ___ _ __ | |_ 
//  | |   | '__/ _ \/ _` | __/ _ \ | |   | | |/ _ \ '_ \| __|
//  | \__/\ | |  __/ (_| | ||  __/ | \__/\ | |  __/ | | | |_ 
//   \____/_|  \___|\__,_|\__\___|  \____/_|_|\___|_| |_|\__|

const client: customClient = new Client({
	partials: ["MESSAGE", "REACTION", "CHANNEL"],
	intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MESSAGE_REACTIONS", "DIRECT_MESSAGES", "DIRECT_MESSAGE_REACTIONS"]
});

const commands = new Map<string, Command>();
client.commands = commands;

//  _                     _   _____                                           _     
// | |                   | | /  __ \                                         | |    
// | |     ___   __ _  __| | | /  \/ ___  _ __ ___  _ __ ___   __ _ _ __   __| |___ 
// | |    / _ \ / _` |/ _` | | |    / _ \| '_ ` _ \| '_ ` _ \ / _` | '_ \ / _` / __|
// | |___| (_) | (_| | (_| | | \__/\ (_) | | | | | | | | | | | (_| | | | | (_| \__ \
// \_____/\___/ \__,_|\__,_|  \____/\___/|_| |_| |_|_| |_| |_|\__,_|_| |_|\__,_|___/


const helpChoices: CommandOptionChoice[] = [];
//match dirs that don't start with _
for (const dir of readdirSync(`${__dirname}/commands`).filter(dir => /^[^_].*$/.test(dir))) {
	//match files that end in .js and don't start with _
	for (const file of readdirSync(`${__dirname}/commands/${dir}`).filter(file => /^[^_].*\.js$/.test(file))) {
		const command: Command = (await import(`./commands/${dir}/${file}`)).command;
		command.category = dir;
		if (command.cooldown > 0) command.cooldowns = new Map<string, number>();
		commands.set(command.name, command);
		if (command.category !== "dev") helpChoices.push({name: `/${command.name}`, value: command.name});
	}
}

const help = commands.get("help");
if (help) {
	help.options[0].choices = helpChoices;
}

// ______           _     _              _____                                           _     
// | ___ \         (_)   | |            /  __ \                                         | |    
// | |_/ /___  __ _ _ ___| |_ ___ _ __  | /  \/ ___  _ __ ___  _ __ ___   __ _ _ __   __| |___ 
// |    // _ \/ _` | / __| __/ _ \ '__| | |    / _ \| '_ ` _ \| '_ ` _ \ / _` | '_ \ / _` / __|
// | |\ \  __/ (_| | \__ \ ||  __/ |    | \__/\ (_) | | | | | | | | | | | (_| | | | | (_| \__ \
// \_| \_\___|\__, |_|___/\__\___|_|     \____/\___/|_| |_| |_|_| |_| |_|\__,_|_| |_|\__,_|___/
//             __/ |                                                                           
//            |___/

client.once("ready", async () => {
	// ! Register slash commands globally for release version
	// client.appCmdManager = client.application!.commands;
	client.appCmdManager = client.guilds.cache.get(config.dev_guild_id)!.commands;

	client.user?.setActivity("/help", { type: "PLAYING" });
	await client.appCmdManager.set(Array.from(commands, el => el[1]));

	console.log(`${client.user?.tag} has logged in.`);
});

//  _                                   _____                                           _
// | |                                 /  __ \                                         | |
// | |     ___  __ _  __ _  ___ _   _  | /  \/ ___  _ __ ___  _ __ ___   __ _ _ __   __| |___
// | |    / _ \/ _` |/ _` |/ __| | | | | |    / _ \| '_ ` _ \| '_ ` _ \ / _` | '_ \ / _` / __|
// | |___|  __/ (_| | (_| | (__| |_| | | \__/\ (_) | | | | | | | | | | | (_| | | | | (_| \__ \
// \_____/\___|\__, |\__,_|\___|\__, |  \____/\___/|_| |_| |_|_| |_| |_|\__,_|_| |_|\__,_|___/
//              __/ |            __/ |
//             |___/            |___/

client.on("messageCreate", async (msg) => {
	if (msg.author.bot || !msg.content.startsWith(config.prefix)) return;
	msg.reply({content: `${config.prefix} commands are depricated, use / instead. Do /help for help`});
});

//  _   _                 _ _        _____                                           _     
// | | | |               | | |      /  __ \                                         | |    
// | |_| | __ _ _ __   __| | | ___  | /  \/ ___  _ __ ___  _ __ ___   __ _ _ __   __| |___ 
// |  _  |/ _` | '_ \ / _` | |/ _ \ | |    / _ \| '_ ` _ \| '_ ` _ \ / _` | '_ \ / _` / __|
// | | | | (_| | | | | (_| | |  __/ | \__/\ (_) | | | | | | | | | | | (_| | | | | (_| \__ \
// \_| |_/\__,_|_| |_|\__,_|_|\___|  \____/\___/|_| |_| |_|_| |_| |_|\__,_|_| |_|\__,_|___/

client.on("interactionCreate", async interaction => {
	// Check interaction is from a slash command; buttons and drop downs also create interactions
	if (interaction.isCommand()) {
		try {
			const command = commands.get(interaction.commandName);
			if (command && interaction.member instanceof GuildMember) {
				const id = interaction.member.id;
				// check if user has permission to use that command
				//! Discord API currently doesn't allow setting of permissions for discord perms for slash commands, only roles. This means the commands will be visible to people who can't use them https://github.com/discord/discord-api-docs/discussions/3581
				if (command.category === "dev" && id !== config.developer_id) {
					return interaction.reply({ content: `⛔ /${command.name} is a developer command, you may not use it`, ephemeral: true });
				}
				if (command.perms) {
					if (interaction.channel && interaction.channel.type !== "DM") {
						const authorPerms = interaction.channel.permissionsFor(interaction.member);
						if (!authorPerms || !authorPerms.has(command.perms)) {
							return interaction.reply({ content: `⛔ ${parsePermissions(command.perms)} is required to use this command`, ephemeral: true });
						}
					} else {
						return interaction.reply({ content: "⛔ This command is server only and cannot be used in dms or group dms", ephemeral: true });
					}
				}
				// check if the user is on cooldown, if this command has a cooldown
				if (command.cooldowns) {
					const now = Date.now();
					const cooldown = command.cooldown * 1000;

					if (command.cooldowns.has(id)) {
						const expirationTime = command.cooldowns.get(id)! + cooldown;
						if (now < expirationTime) {
							return interaction.reply({ content: `🕙 You can only use this command once every ${command.cooldown} seconds,\nyou have ${Math.round((expirationTime - now)/1000)} seconds until you can use it again`, ephemeral: true });
						}
					}
					command.cooldowns.set(id, now);
					setTimeout(() => command.cooldowns?.delete(id), cooldown);
				}
				// Ensure messages that are specified as ephemeral are ephemeral
				if (interaction.options.getBoolean("ephemeral") || command.ephemeral) {
					await interaction.deferReply({ ephemeral: true });
				} else {
					await interaction.deferReply(); // by deferring we have 15m to respond, but cannot use reply on the interaction, only followUp and editReply
				}
				await command.execute(interaction);
			}
		} catch (e) {
			console.log(e);
			const err = new ErrorEmbed("Failed to execute command", e as string);
			await interaction.followUp({ embeds: [err], ephemeral: true });
		}
	}
});

// ______      _               _           _                 _ _
// | ___ \    (_)             | |         | |               | (_)
// | |_/ /_ __ _ _ __   __ _  | |__   ___ | |_    ___  _ __ | |_ _ __   ___
// | ___ \ '__| | '_ \ / _` | | '_ \ / _ \| __|  / _ \| '_ \| | | '_ \ / _ \
// | |_/ / |  | | | | | (_| | | |_) | (_) | |_  | (_) | | | | | | | | |  __/
// \____/|_|  |_|_| |_|\__, | |_.__/ \___/ \__|  \___/|_| |_|_|_|_| |_|\___|
//                      __/ |
//                     |___/

// load all env variables in .env file
(await import("dotenv")).config();
// log in
client.login(process.env["TOKEN"]);