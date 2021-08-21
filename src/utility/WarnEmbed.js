const { MessageEmbed } = require("discord.js");
const config = require("../config.json");

module.exports = class Embed extends MessageEmbed {
	constructor(title, description) {
		super();

		this.setTitle(`${title}`);
		this.setDescription(`${description}`);
		this.setColor(config.colors.embed.warn);
	}
};