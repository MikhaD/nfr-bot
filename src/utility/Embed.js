const { MessageEmbed } = require("discord.js");
const config = require("../config.json");

module.exports = class Embed extends MessageEmbed {
	constructor(title, description) {
		super();
		this.setTitle(`${title}`);
		this.setDescription(`${description}`);
		this.setColor(config.colors.embed.default);
		this.index = 0;
		this.fieldCount = 0;
		this.pages = [this];
	}

	firstPage() {
		this.index = 0;
		return this;
	}

	lastPage() {
		this.index = this.pages.length - 1;
		return this.pages.at(-1);
	}

	addField(title, text, inline) {
		const maxFields = 25;
		++this.fieldCount;
		if (this.fieldCount > 1 && this.fieldCount % maxFields === 1) {
			const emb = new MessageEmbed().setColor(this.color);
			if (this.thumbnail) emb.setThumbnail(this.thumbnail.url);
			this.pages.push(emb);
		}
		if (this.fieldCount > maxFields) {
			this.pages.at(-1).addField(title, text, inline);
		} else {
			super.addField(title, text, inline);
		}
	}

	nextPage() {
		if (++this.index >= this.pages.length) {
			this.index = 0;
			return null;
		} else {
			return this.pages[this.index];
		}
	}

	previousPage() {
		if (this.index === 0) {
			return null;
		}
		return this.pages[--this.index];
	}
};