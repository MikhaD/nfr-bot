import { readdirSync } from "fs";
import path from "path";
import { Command, customClient } from "../../types";
import { SuccessEmbed } from "../../utility/Embed.js";

import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL(".", import.meta.url))

const choices = [];
//match dirs that don't start with _
for (const dir of readdirSync(path.join(__dirname, "../")).filter(dir => /^[^_].*$/.test(dir))) {
	//match files that end in .js and don't start with _
	for (const file of readdirSync(path.join(__dirname, `../${dir}`)).filter(file => /^[^_].*\.js$/.test(file))) {
		choices.push({name: `/${file.slice(0, -3)}`, value: file.slice(0, -3)});
	}
}

export const command: Command = {
	name: "reload",
	description: "reload the given command",
	ephemeral: true,
	perms: ["ADMINISTRATOR"],
	cooldown: 0,
	options: [{
		name: "command",
		type: "STRING",
		description: "The command to reload",
		required: true,
		choices: choices
	}],

	async execute(interaction) {
		const client: customClient = interaction.client;
		const commandName = interaction.options.getString("command")!;
		const command = client.commands?.get(commandName);
		if (!command) return;
		// the querystring ?update=${Date.now()} at the end is a trick to bust the import cache, any consistantly different query would work
		const commandDir = path.join(__dirname, `../${command.category}/${command.name}.js?update=${Date.now()}`);

		const newCommand: Command = (await import(commandDir)).command;
		newCommand.category = command.category;
		if (command.cooldown > 0) command.cooldowns = new Map<string, number>();
		for (const i of client.appCmdManager!.cache) {
			if (i[1].name === commandName) {
				await client.appCmdManager?.edit(i[0], newCommand);
				client.commands?.set(command.name, newCommand);
				break;
			}
		}
		await interaction.followUp(new SuccessEmbed(`/${command.name} sucessfully reloaded.`, ""));
	}
};