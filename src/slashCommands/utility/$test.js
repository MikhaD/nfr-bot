const { CommandInteraction } = require("discord.js");

module.exports = {
	name: "test",
	description: "A test / command with whatever functionality I'm currently testing that requires a discord context",
	defaultPermission: false,
	permissions: [{
		id: "420905576508293132",
		type: "USER",
		permission: true
	}],
	/**
	 * @param {CommandInteraction} interaction
	 */
	execute(interaction) {
		// interaction.followUp(`${randint(6)}`);
		interaction.followUp({ content: "content 2", allowedMentions: { repliedUser: true }});
	}
};