import { HexColorString, MessageEmbed, MessageOptions } from "discord.js";
import { EmbedPages } from "../types";
import config from "../config.json";

/** A multi page capable message embed with the default color highlight, cabable of being sent without needing to be wrapped in a MessageOptions object */
export default class Embed extends MessageEmbed implements EmbedPages, MessageOptions {
	index: number;
	fieldCount: number;
	pages: MessageEmbed[];
	embeds: Embed[];
	pageNumbersOn: boolean;
	/**
	 * @param title - The embed title. `default: ""`
	 * @param description - The embed description. `default: ""`
	 * @param pageNumbersOn - Whether or not to enable page numbers. `default: false`
	 */
	constructor(title="", description="", pageNumbersOn=false) {
		super();
		this.setTitle(`${title}`);
		this.setDescription(`${description}`);
		this.setColor(config.colors.embed.default as HexColorString);
		this.index = 0;
		this.fieldCount = 0;
		this.pages = [this];
		/** This property allows Embed objects to be send directly */
		this.embeds = [this];
		this.pageNumbersOn = pageNumbersOn;
	}

	/**
	 * Adds a field to the embed, max 25 per page.
	 * @param title - The title of this field. `default: "\u200b"`
	 * @param text - The text of this field. `default: "\u200b"`
	 * @param inline - If this field will be displayed inline. `default: false`
	 * @returns this
	 */
	addField(title="\u200b", text="\u200b", inline=false): this {
		const maxFields = 25;
		++this.fieldCount;
		if (this.fieldCount > 1 && this.fieldCount % maxFields === 1) {
			const emb = new MessageEmbed();
			if (this.color) emb.setColor(this.color);
			if (this.thumbnail) emb.setThumbnail(this.thumbnail.url);
			this.pages.push(emb);
			// update existing pages page numbers to be out of the new number of pages
			if (this.pageNumbersOn) this.pageNumbers(true);
		}
		if (this.fieldCount > maxFields) {
			this.pages.at(-1)?.addField(title, text, inline);
		} else {
			super.addField(title, text, inline);
		}
		return this;
	}

	/**
	 * Set the thumbnail of this embed and all its pages.
	 * @param url - The url of the thumbnail image
	 * @returns this
	 */
	setThumbnail(url: string): this {
		super.setThumbnail(url);
		for (const page of this.pages.slice(1)) {
			page.setThumbnail(url);
		}
		return this;
	}

	/**
	 * Enable or disable page numbers
	 * @param {Boolean} pageNumbersOn - Whether you want page numbers on or not
	 * @returns this
	 */
	pageNumbers(pageNumbersOn: boolean): this {
		this.pageNumbersOn = pageNumbersOn;
		if (this.pages.length > 1) {
			for (let i = 0; i < this.pages.length; ++i) {
				this.pages[i].setFooter(pageNumbersOn ? `${i+1} of ${this.pages.length}`: "");
			}
		}
		return this;
	}

	/**
	 * Return the next page, or `null` if on the last page.
	 * @returns The next page or `null`
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
	 * @returns The previous page or `null`
	 */
	previousPage() {
		if (this.index === 0) {
			return null;
		}
		return this.pages[--this.index];
	}

	/**
	 * Return the first page and set the index to 0
	 * @returns The first page
	 */
	firstPage(): MessageEmbed {
		this.index = 0;
		return this;
	}

	/**
	 * Return the first page and set the index to the last element
	 * @returns - The last page
	 */
	lastPage() {
		this.index = this.pages.length - 1;
		return this.pages.at(-1) || null;
	}
}

/** Create a new message embed with the success highlight */
export class SuccessEmbed extends Embed {
	/**
	 * @param title - The success message title. `default: ""`
	 * @param description - The success message description. `default: ""`
	 */
	constructor(title="", description="") {
		super(title, description);

		this.setColor(config.colors.embed.success as HexColorString);
	}
}

/** Create a new message embed with the warning highlight */
export class WarnEmbed extends Embed {
	/**
	 * @param title - The warning message title. `default: ""`
	 * @param description - The warning message description. `default: ""`
	 */
	constructor(title="", description="") {
		super(title, description);

		this.setColor(config.colors.embed.warn as HexColorString);
	}
}

/** Create a new message embed with the error highlight */
export class ErrorEmbed extends Embed {
	/**
	 * @param title - The error message title. `default: ""`
	 * @param description - The error message description. `default: ""`
	 */
	constructor(title="", description="") {
		super(title, description);

		this.setColor(config.colors.embed.error as HexColorString);
	}
}