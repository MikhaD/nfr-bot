const { MessageEmbed } = require("discord.js");
const config = require("../config.json");

module.exports = class Embed extends MessageEmbed {
	/**
	 * Create a new message embed with the warning highlight
	 * @param {string} title - The warning message title
	 * @param {string} description - The warning message description
	 */
	constructor(title, description) {
		super();

		this.setTitle(`${title}`);
		this.setDescription(`${description}`);
		this.setColor(config.colors.embed.warn);
	}
};