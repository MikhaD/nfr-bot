const path = require("path");
const config = require(path.join(__dirname, "../../config.json"));
const { createErrorEmbed, createWarnEmbed, createStandardEmbed, parseArguments, parsePermissions } = require(path.join(__dirname, "../../utility/utility"));
const { MessageEmbed } = require("discord.js");


module.exports = {
	name: "help",
	aliases: ["commands"],
	args: {
		optional: ["command"]
	},
	description: "Show the help menu, or help info for a command.",
	example: "help absences",
	cooldown: 2,

	execute(msg, args) {
		const { commands } = msg.client;
		if (args.length) {
			const command = commands.get(args[0].toLowerCase()) || commands.find(i => i.aliases && i.aliases.includes(args[0].toLowerCase()));
			if (command) {
				const helpEmbed = new MessageEmbed();
				//i Developer command
				if (command.dev) {
					helpEmbed.setTitle("❗ Developer Command ❗");
					helpEmbed.setDescription("**Please only use if you know what you are doing.**");
					helpEmbed.setColor(config.colors.embed.warn);
					helpEmbed.addField(`${config.prefix}${command.name} ${parseArguments(command)}`, command.description);
				} else {
					helpEmbed.setTitle(`${config.prefix}${command.name} ${parseArguments(command)}`);
					helpEmbed.setDescription(command.description);
					helpEmbed.setColor(config.colors.embed.default);
				}
				//i Example
				if (command.example) helpEmbed.addField("Example:", `${config.prefix}${command.example}`);
				//i Aliases
				if (command.aliases) {
					let aliasString = "";
					for (const alias of command.aliases) {
						aliasString += (args[0].toLowerCase() === alias) ? `**${alias}**, ` : `${alias}, `;
					}
					helpEmbed.addField("Aliases:", aliasString.slice(0, -2));
				}
				//i Permissions
				if (command.permissions) helpEmbed.addField("Permissions:", parsePermissions(command.permissions));
				//i Cooldown
				if ((command.cooldown && command.cooldown > 0) || config.default_cooldown > 0) {
					helpEmbed.addField("Cooldown:", `${(command.cooldown) ? command.cooldown : config.default_cooldown} seconds`);
				}
				msg.channel.send({embeds: [helpEmbed]});
			} else {
				msg.channel.send({embeds: [createErrorEmbed(
					`${config.prefix}${args[0].toLowerCase()} is not a valid command`,
					`Type \`${config.prefix}${this.name}\` to see the list of commands.`
				)]});
			}
		} else {
			const helpEmbed = createStandardEmbed(
				"Command Help",
				`Call ${config.prefix}${this.name} on a specific command for more information about it.\nFormat: <required arguments> [optional arguments]`
			);
			for (const cmd of commands) {
				if (!cmd[1].dev) {
					helpEmbed.addField(`${config.prefix}${cmd[0]} ${parseArguments(cmd[1])}`, cmd[1].description);
				}
			}
			helpEmbed.setFooter(`Page 1 of ${Math.ceil(commands.size / 25)}`);
			msg.channel.send({embeds: [helpEmbed]});
		}
	},
};