const { MessageEmbed, Collection } = require("discord.js");
const config = require("../config.json");

module.exports = class Embed extends MessageEmbed {
	constructor(title, description) {
		super();

		this.pages = new Collection();
		this.pageNames = [];
		this.setTitle(`${title}`);
		this.setDescription(`${description}`);
		this.setColor(config.colors.embed.default);
	}

	/**
	 * Return the embed page with the given name
	 * @param {String} name - The name of the page to return
	 * @returns the MessageEmbed with the given name, or undefined if it doesn't exist
	 */
	page(name) {
		return this.pages.get(name);
	}

	addPage(name, embed) {
		this.pageNames.push(name);
		this.pages.set(name, embed);
	}
};