const fs = require("fs");
const path = require("path");
const config = require(path.join(__dirname, "../../config.json"));
const { createSuccessEmbed, createErrorEmbed } = require(path.join(__dirname, "../../utility/utility"));

module.exports = {
	name: "reload",
	args: {
		required: ["command"]
	},
	description: "Reload the given command. To reload a slash command prefix the command name with /",
	example: "reload absences",
	permissions: ["DEV"],
	dev: true,

	async execute(msg, args) {
		let slash = false;
		let commands;
		let commandName = args[0].toLowerCase();
		if (commandName.startsWith("/")) {
			commandName = commandName.slice(1);
			commands = msg.client.slashCommands;
			slash = true;
		} else {
			commands = msg.client.commands;
		}
		const command = commands.get(commandName) || commands.find(i => i.aliases && i.aliases.includes(commandName));

		if (command) {
			//i Find the path of the command and delete the require cache
			const commandFileName = `${(command.dev) ? config.dev_cmd_file_prefix : ""}${command.name}.js`;
			const commandsDir = path.join(__dirname, `../../${slash ? "slashCommands" : "commands"}`);
			const commandDirs = fs.readdirSync(commandsDir);
			const dirName = commandDirs.find((dir) => fs.readdirSync(`${commandsDir}/${dir}`).includes(commandFileName));

			delete require.cache[`${commandsDir}/${dirName}/${commandFileName}`];

			try {
				const newCommand = require(`${commandsDir}/${dirName}/${commandFileName}`);
				//i Reload if the command is a slash command
				if (slash) {
					let succeeded = false;
					for (const i of msg.client.appCmdManager.cache) {
						if (i[1].name === commandName) {
							await msg.client.appCmdManager.edit(i[0], newCommand);
							msg.client.slashCommands.set(command.name, newCommand);
							succeeded = true;
							break;
						}
					}
					if (!succeeded) {
						throw new Error(`could not get command ID for ${commandName}`);
					}
				} else {
					//i Reload if the command is not a slash command
					msg.client.commands.set(command.name, newCommand);
				}
				msg.channel.send({embeds: [createSuccessEmbed(`${slash ? "/" : config.prefix}${command.name} sucessfully reloaded.`, "")]});
			} catch (e) {
				console.error(e);
				msg.channel.send({embeds: [createErrorEmbed(
					`Failed to reload ${slash ? "/" : config.prefix}${command.name}`,
					e.message
				)]});
			}
		} else {
			msg.client.commands.get("help").execute(msg, [commandName]);
		}
	}
};