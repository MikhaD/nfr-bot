// const config = require("../../config.json");
const { createStandardEmbed } = require("../../utility/utility");
const Discord = require("discord.js");

module.exports = {
	name: "test",
	args: {},
	description: "A test command with whatever functionality I'm currently testing that requires a discord context",
	example: "test",
	permissions: ["DEV"],
	dev: true,

	/**
	 * @param {Discord.Message} msg
	 * @param {*} args
	 */
	execute(msg, args) {
		msg.reply(`Owner: ${msg.author}`);
	}
};