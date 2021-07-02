const config = require("../../config.json");
const {createErrorEmbed, createSimpleEmbed, parseArguments} = require("./_utility");


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
				let helpEmbed = createSimpleEmbed(`${config.prefix}${command.name} ${parseArguments(command)}`, command.description);
				if (command.example) helpEmbed.addField("Example:", command.example);
				if (command.aliases) {
					let aliasString = "";
					for (let alias of command.aliases) {
						if (args[0].toLowerCase() === alias) {
							alias = `**${alias}**`;
						}
						aliasString += `${alias}, `;
					}
					helpEmbed.addField("Aliases:", aliasString.slice(0, -2));
				}
				helpEmbed.addField("Cooldown:", `${(command.cooldown) ? command.cooldown : config.default_cooldown} seconds`);
				msg.channel.send(helpEmbed);
			} else {
				msg.channel.send(createErrorEmbed(`${config.prefix}${command} is not a valid command`, `Type \`${config.prefix}help\` to see the list of commands.`));
			}
		} else {
			let helpEmbed = createSimpleEmbed("Command Help", `Call ${config.prefix}help on a specific command for more information about it.`);
			for (let cmd of commands) {
				helpEmbed.addField(`${config.prefix}${cmd[0]} ${parseArguments(cmd[1])}`, cmd[1].description);
			}
			helpEmbed.setFooter(`Page 1 of ${Math.ceil(commands.size / 25)}`);
			msg.channel.send(helpEmbed);
		}
	},
};