import { Message } from "discord.js";
import { Command } from "../../types";
import Embed from "../../utility/Embed";
import MessageObject from "../../utility/MessageObject";
import { parseArguments, parsePermissions } from "../../utility/utility";
import { global } from "../..";

export const command: Command = {
	name: "help",
	description: "Show the help menu, or help info for a command",
	ephemeral: false,
	perms: [],
	cooldown: 0,
	options: [{
		name: "command",
		type: "STRING",
		description: "The command you want help with",
		required: false
	}],

	async execute(interaction) {
		const command = global.commands.get(interaction.options.getString("command") || "");
		if (command) {
			const embed = new Embed(`/${command.name} help`, command.description);
			// Syntax
			let syntax = `\`/${command.name}${parseArguments(command)}\`\n`;
			if (command.options) {
				for (const option of command.options) {
					// description, required, options
					syntax += `\`${option.name}\`: ${option.description}
					required: ${option.required}
					${(option.choices ? "choices: " + option.choices.reduce((str, c) => `${str}, ${c.name}`, "\b").slice(2) + "\n": "")}`;
				}
			}
			embed.addField("Syntax", syntax);
			// Permissions
			if (command.perms) embed.addField("Permissions", parsePermissions(command.perms));
			// Cooldown
			if (command.cooldown) embed.addField("Cooldown", `${command.cooldown} seconds`);
			// Catgory
			embed.setFooter(`\ncommand category: ${command.category}`);

			await interaction.followUp(embed);
		} else {
			const message = new MessageObject();
			const categories = new Map();
			for (const cmd of global.commands) {
				if (cmd[1].category !== "dev") {
					if (!categories.get(cmd[1].category)) {
						categories.set(cmd[1].category, new Embed(`${cmd[1].category} commands`));
					}
					categories.get(cmd[1].category).addField(`/${cmd[0]} ${parseArguments(cmd[1])}`, cmd[1].description);
				}
			}
			for (const embed of categories.values()) {
				message.addPage(embed);
			}
			message.watchMessage(await interaction.followUp(message) as Message);
		}
	}
};