const { MessageEmbed } = require("discord.js");
const config = require("../config.json");

module.exports.Embed = class Embed extends MessageEmbed {
	/**
	 * Create a new multi page capable message embed with the default color highlight
	 * @param {string} title - The embed title
	 * @param {string} description - The embed description
	 * @param {boolean} pageNumbersOn - Whether or not to enable page numbers, false by default (optional)
	 */
	constructor(title, description, pageNumbersOn) {
		super();
		this.setTitle(`${title}`);
		this.setDescription(`${description}`);
		this.setColor(config.colors.embed.default);
		this.index = 0;
		this.fieldCount = 0;
		this.pages = [this];
		this.pageNumbersOn = pageNumbersOn || false;
	}

	/**
	 * Adds a field to the embed, max 25 per page.
	 * @param {string} title - The title of this field
	 * @param {string} text - The text of this field
	 * @param {boolean} inline - If this field will be displayed inline (default: false)
	 */
	addField(title, text, inline) {
		const maxFields = 25;
		++this.fieldCount;
		if (this.fieldCount > 1 && this.fieldCount % maxFields === 1) {
			const emb = new MessageEmbed().setColor(this.color);
			if (this.thumbnail) emb.setThumbnail(this.thumbnail.url);
			this.pages.push(emb);
			// update existing pages page numbers to be out of the new number of pages
			if (this.pageNumbersOn) this.pageNumbers(true);
		}
		if (this.fieldCount > maxFields) {
			this.pages.at(-1).addField(title, text, inline);
		} else {
			super.addField(title, text, inline);
		}
	}

	/**
	 * Set the thumbnail of this embed and all its pages.
	 * @param {string} url - The url of the thumbnail image
	 */
	setThumbnail(url) {
		super.setThumbnail(url);
		for (const page of this.pages.slice(1)) {
			page.setThumbnail(url);
		}
	}

	/**
	 * Enable or disable page numbers
	 * @param {Boolean} pageNumbersOn - Whether you want page numbers on or not
	 */
	pageNumbers(pageNumbersOn) {
		this.pageNumbersOn = pageNumbersOn;
		if (this.pages.length > 1) {
			for (let i = 0; i < this.pages.length; ++i) {
				this.pages[i].setFooter(pageNumbersOn ? `${i+1} of ${this.pages.length}`: "");
			}
		}
	}

	/**
	 * Return the next page, or `null` if on the last page.
	 * @returns {Embed} The next page
	 */
	nextPage() {
		if (++this.index >= this.pages.length) {
			this.index = 0;
			return null;
		} else {
			return this.pages[this.index];
		}
	}

	/**
	 * Return the previous page, or `null` if on the first page.
	 * @returns {Embed} The previous page
	 */
	previousPage() {
		if (this.index === 0) {
			return null;
		}
		return this.pages[--this.index];
	}

	/**
	 * Return the first page and set the index to 0
	 * @returns {Embed} - THe first page
	 */
	firstPage() {
		this.index = 0;
		return this;
	}

	/**
	 * Return the first page and set the index to the last element
	 * @returns {Embed} - THe last page
	 */
	lastPage() {
		this.index = this.pages.length - 1;
		return this.pages.at(-1);
	}
};

module.exports.SuccessEmbed = class SuccessEmbed extends MessageEmbed {
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

module.exports.WarnEmbed = class WarnEmbed extends MessageEmbed {
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

module.exports.ErrorEmbed = class ErrorEmbed extends MessageEmbed {
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