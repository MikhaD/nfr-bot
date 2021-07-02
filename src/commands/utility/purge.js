const config = require("../../config.json");
const {createErrorEmbed, createWarnEmbed, parseArguments} = require("./_utility");
const { MessageEmbed } = require("discord.js");

module.exports = {
	name: "purge",
	aliases: ["prune"],
	args: {
		required: ["messages"],
		optional: ["hide success msg"]
	},
	description: "Delete <messages> number of messages.",
	example: "purge 15 true",
	serverOnly: true,
	cooldown: 5,

	async execute(msg, args) {
		if (args.length >= 1 && !isNaN(args[0])) {
			//i +1 one to also delete the message with the command
			let messages = Math.round(parseInt(args[0])) + 1;
			if (messages < 2) {
				msg.channel.send(createErrorEmbed("Invalid number of messages", "You must purge at least 1 or more messages."));
				return;
			}

			let hundreds = Math.floor(messages / 100);
			let remainder = messages % 100;

			let totalDeleted = 0;

			if (remainder > 0) {
				let e = await msg.channel.bulkDelete(remainder, true);
				totalDeleted += e.size;
			}
			for (let i = 0; i < hundreds; ++i) {
				let e = await msg.channel.bulkDelete(100, true);
				totalDeleted += e.size;
			}

			if ((args.length < 2 || args[1].toLowerCase() !== "true") && totalDeleted === messages) {
				let successEmbed = new MessageEmbed()
					.setColor(config.embed.colors.success)
					.setTitle(`${messages -1} message${(messages !== 2) ? "s": ""} deleted from #${msg.channel.name}`)
					.setDescription(`Use \`${config.prefix}purge <number of messages> true\` to not show this message`);

				msg.channel.send(successEmbed);
			} else if (totalDeleted !== messages) {
				msg.channel.send(
					createWarnEmbed(`${totalDeleted - 1} of ${messages - 1} messages deleted`, "Messages over 2 weeks old are unable to be deleted"));
			}
		} else {
			msg.channel.send(createErrorEmbed(
				"Invalid command syntax",
				`The syntax for purge is:\n\`${config.prefix}purge ${parseArguments(msg.client.commands.get("purge"))}\``)
			);
		}
	}
};