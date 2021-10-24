const { SuccessEmbed, WarnEmbed } = require("../../utility/Embed");

module.exports = {
	name: "purge",
	description: "Delete a given number of messages from this channel",
	cooldown: 5,
	options: [{
		name: "messages",
		type: "INTEGER",
		description: "The number of messages to delete",
		required: true
	},
	{
		name: "ephemeral",
		type: "BOOLEAN",
		description: "Don't show the success message",
		required: false
	}],
	perms: ["ADMINISTRATOR"],

	async execute(interaction) {
		const ephemeral = interaction.options.getBoolean("ephemeral");
		const messages = interaction.options.getInteger("messages") + !ephemeral;

		if (messages < 1) return;
		const hundreds = Math.floor(messages / 100);
		const remainder = messages % 100;

		let totalDeleted = 0;

		if (remainder > 0) {
			const e = await interaction.channel.bulkDelete(remainder, true);
			totalDeleted += e.size;
		}
		for (let i = 0; i < hundreds; ++i) {
			const e = await interaction.channel.bulkDelete(100, true);
			totalDeleted += e.size;
		}

		if (totalDeleted === messages) {
			if (ephemeral) {
				await interaction.followUp({embeds: [new SuccessEmbed(
					`${messages} message${(messages !== 1) ? "s" : ""} deleted from #${interaction.channel.name}`,
					""
				)]});
			} else {
				await interaction.channel.send({embeds: [new SuccessEmbed(
					`${messages - 1} message${(messages !== 2) ? "s" : ""} deleted from #${interaction.channel.name}`,
					"Use `ephemeral: true` to not show this message"
				)]});
			}
		} else if (totalDeleted !== messages) {
			if (ephemeral) {
				await interaction.followUp({embeds: [new WarnEmbed(
					`${totalDeleted} of ${messages} messages deleted`,
					"Messages over 2 weeks old are unable to be deleted"
				)]});
			} else {
				await interaction.channel.send({embeds: [new WarnEmbed(
					`${totalDeleted - 1} of ${messages - 1} messages deleted`,
					"Messages over 2 weeks old are unable to be deleted"
				)]});
			}
		}
	}
};