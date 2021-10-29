import { readdirSync } from "fs";
import path from "path";
import { Command } from "../../types";
import { SuccessEmbed } from "../../utility/Embed";
import { global } from "../..";

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
		const commandName = interaction.options.getString("command")!;
		const command = global.commands.get(commandName)!;
		const commandDir = path.join(__dirname, `../${command.category}/${command.name}`);
		delete require.cache[`${commandDir}.js`];

		const newCommand = require(commandDir);
		newCommand.category = command.category;
		for (const i of global.appCmdManager.cache) {
			if (i[1].name === commandName) {
				await global.appCmdManager.edit(i[0], newCommand);
				global.commands.set(command.name, newCommand);
				break;
			}
		}
		await interaction.followUp(new SuccessEmbed(`/${command.name} sucessfully reloaded.`, ""));
	}
};