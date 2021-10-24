const { Embed } = require("../../utility/Embed");
const MessageObject = require("../../utility/MessageObject");
const { parseArguments, parsePermissions } = require("../../utility/utility");

module.exports = {
	name: "help",
	description: "Show the help menu, or help info for a command",
	options: [{
		name: "command",
		type: "STRING",
		description: "The command you want help with",
		required: false
	}],

	async execute(interaction) {
		const cmd = interaction.options.getString("command");
		if (cmd) {
			const command = interaction.client.commands.get(cmd);
			const embed = new Embed(`/${command.name} help`, command.description);
			//info Syntax
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
			//info Permissions
			if (command.perms) embed.addField("Permissions", parsePermissions(command.perms));
			//info Cooldown
			if (command.cooldown) embed.addField("Cooldown", `${command.cooldown} seconds`);
			//info Catgory
			embed.setFooter(`\ncommand category: ${command.category}`);

			await interaction.followUp(embed);
		} else {
			const message = new MessageObject();
			const categories = new Map();
			for (const cmd of interaction.client.commands) {
				if (!categories.get(cmd[1].category)) {
					categories.set(cmd[1].category, new Embed(`${cmd[1].category} commands`));
				}
				categories.get(cmd[1].category).addField(`/${cmd[0]} ${parseArguments(cmd[1])}`, cmd[1].description);
			}
			for (const embed of categories.values()) {
				message.addPage(embed);
			}
			const msg = await interaction.followUp(message);
			message.watchMessage(msg);
		}
	}
};