const helpFile = require("../../help.json");
const config = require("../../config.json");
const {createErrorEmbed, createSimpleEmbed, helpForCommand} = require("./_utility");
const { MessageEmbed } = require("discord.js");


module.exports = {
	name: "help",
	args: {
		optional: ["command"]
	},
	description: "Show the help menu, or help info for a command.",
	example: "help absences",
	cooldown: 2,

	execute(msg, args) {
		if (args.length > 0) {
			let command = args[0].toLowerCase();
			let helpObj = helpForCommand(command);
			if (helpObj === null) {
				msg.channel.send(createErrorEmbed(`${config.prefix}${command} is not a valid command`, `Type \`${config.prefix}help\` to see the list of commands.`));
			} else {
				let embed = createSimpleEmbed(`${config.prefix}${command}${helpObj.parameters}`, helpObj.description);
				embed.addField("Example:", helpObj.example);
				msg.channel.send(embed);
			}
		} else {
			// just loop through them all for now, put them in categories once I have more commands
			let helpObj = helpForCommand("help");
			let helpEmbed = new MessageEmbed()
				.setTitle("Command Help")
				.setDescription(`Call ${config.prefix}help on a specific command to see an example.`)
				.setColor(config.embed.colors.default)
				.addField(`${config.prefix}help${helpObj.parameters}`, helpObj.description)
				// .setFooter(`\n◀️Previous, ▶️Next\n\npage 1 of ${1}`); //! change this to reflect the actual values
				.setFooter("\n\npage 1 of 1");
			for (let cmd of Object.keys(helpFile)) {
				if (cmd !== "help"){
					helpObj = helpForCommand(cmd);
					helpEmbed.addField(`${config.prefix}${cmd}${helpObj.parameters}`, helpObj.description);
				}
			}
			msg.channel.send(helpEmbed);
		}
	}
};