const { MessageEmbed } = require("discord.js");
const config = require("../config.json");

module.exports = class Embed extends MessageEmbed {
	/**
	 * Create a new message embed with the success highlight
	 * @param {string} title - The success message title
	 * @param {string} description - The success message description
	 */
	constructor(title, description) {
		super();

		this.setTitle(`${title}`);
		this.setDescription(`${description}`);
		this.setColor(config.colors.embed.success);
	}
};