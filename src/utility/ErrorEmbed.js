const { MessageEmbed } = require("discord.js");
const config = require("../config.json");

module.exports = class Embed extends MessageEmbed {
	/**
	 * Create a new message embed with the error highlight
	 * @param {string} title - The error message title
	 * @param {string} description - The error message description
	 */
	constructor(title, description) {
		super();

		this.setTitle(`${title}`);
		this.setDescription(`${description}`);
		this.setColor(config.colors.embed.error);
	}
};