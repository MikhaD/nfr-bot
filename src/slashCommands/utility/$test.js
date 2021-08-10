const { CommandInteraction } = require("discord.js");

module.exports = {
	name: "test",
	description: "A test / command with whatever functionality I'm currently testing that requires a discord context",
	permissions: ["DEV"],
	/**
	 * @param {CommandInteraction} interaction
	 */
	execute(interaction) {
		// interaction.followUp(`${randint(6)}`);
		interaction.followUp({ content: "content 2", allowedMentions: { repliedUser: true }});
	}
};