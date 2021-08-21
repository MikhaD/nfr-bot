const { MessageEmbed, Collection } = require("discord.js");
const config = require("../config.json");

module.exports = class Embed extends MessageEmbed {
	/**
	 * Multi page supporting embed object
	 * @param {String} title The title of the embed
	 * @param {String} description The description of the embed
	 */
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

	/**
	 * Add a page to this embed
	 * @param {String} name The internal name for this page
	 * @param {MessageEmbed} embed The embed to use as this page
	 */
	addPage(name, embed) {
		this.pageNames.push(name);
		this.pages.set(name, embed);
	}

	/**
	 * A MessageOptions object containing this embed
	 * @param {Boolean} buttons Add next page buttons if there are multiple pages
	 */
	message(buttons) {
		return {embeds: [this]};
	}
};