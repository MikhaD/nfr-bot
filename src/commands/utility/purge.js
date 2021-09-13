const path = require("path");
const config = require(path.join(__dirname, "../../config.json"));
const { createErrorEmbed, createWarnEmbed } = require(path.join(__dirname, "../../utility/_utility"));
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
	permissions: ["ADMINISTRATOR"],

	async execute(msg, args) {
		if (!isNaN(args[0])) {
			//i +1 one to also delete the message with the command
			const messages = Math.round(parseInt(args[0])) + 1;
			if (messages < 2) {
				msg.channel.send(createErrorEmbed("Invalid number of messages", "You must purge at least 1 or more messages."));
				return;
			}

			const hundreds = Math.floor(messages / 100);
			const remainder = messages % 100;

			let totalDeleted = 0;

			if (remainder > 0) {
				const e = await msg.channel.bulkDelete(remainder, true);
				totalDeleted += e.size;
			}
			for (let i = 0; i < hundreds; ++i) {
				const e = await msg.channel.bulkDelete(100, true);
				totalDeleted += e.size;
			}

			if ((args.length < 2 || args[1].toLowerCase() !== "true") && totalDeleted === messages) {
				const successEmbed = new MessageEmbed()
					.setColor(config.colors.embed.success)
					.setTitle(`${messages - 1} message${(messages !== 2) ? "s" : ""} deleted from #${msg.channel.name}`)
					.setDescription(`Use \`${config.prefix}${this.name} <number of messages> true\` to not show this message`);

				msg.channel.send(successEmbed);
			} else if (totalDeleted !== messages) {
				msg.channel.send(
					createWarnEmbed(`${totalDeleted - 1} of ${messages - 1} messages deleted`, "Messages over 2 weeks old are unable to be deleted"));
			}
		} else {
			msg.client.commands.get("help").execute(msg, [this.name]);
		}
	}
};