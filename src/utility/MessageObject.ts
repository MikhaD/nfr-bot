import { MessageButton, MessageActionRow, MessageEmbed, MessageAttachment, Message, MessageEditOptions, MessageOptions } from "discord.js";
import Embed from "./Embed";
import { EmbedPages } from "../types";

/**
 * A class that enables multi page embeds and can be treated like a MessageOptions object.
 * By calling an instance of this classes `watchMessage` method on the message returned from a send function
 * that sent that MessageObject instance you will enable the embeds added to the object as pages to be paged
 * through. 
 * @implements MessageEditOptions, MessageOptions
 */
export default class MessageObject implements MessageEditOptions, MessageOptions {
	content?: string;
	pages: EmbedChapter;
	embeds: MessageEmbed[];
	components: MessageActionRow[];
	attachments: MessageAttachment[];
	buttonsTimeout: number;
	thumbnail?: string;
	/**
	 * @param text - The message text, if any. `default: ""`
	 */
	constructor(text?: string) {
		if (text) this.content = text;
		this.pages = new EmbedChapter();
		this.embeds = [];
		this.components = [];
		this.attachments = [];
		this.buttonsTimeout = 5 * 60 * 1000;
	}

	/**
	 * Pages should only be added once they have had all of their own pages added to them, otherwise there will be inconsistancies
	 * @param page - Either an Embed or an EmbedChapter
	 * @returns this
	 */
	addPage(page: EmbedPages) {
		this.pages.addPage(page);
		if (this.pages.length === 1) {
			this.embeds.push(this.pages.firstPage()!);
		}
		if ((this.pages.length > 1 || page.pages.length > 1) && this.components.length === 0) {
			this.components = [new MessageActionRow().addComponents(new PrevButton(), new NextButton)];
		}
		return this;
	}

	/**
	 * Set the thumbnail for all embeds added to and in this message
	 * @param thumbnail - The MessageAttachment object for the thumbnail, or the URL to the thumbnail image
	 */
	setThumbnail(thumbnail: string | MessageAttachment) {
		if (typeof thumbnail === "string") {
			this.thumbnail = thumbnail;
		} else {
			this.thumbnail = `attachment://${thumbnail.name}`;
			this.attachments.push(thumbnail);
		}
		this.pages.setThumbnail(this.thumbnail);
	}

	watchMessage(message: Message) {
		if (this.pages.length > 1) {
			const collector = message.createMessageComponentCollector({ componentType: "BUTTON", time: this.buttonsTimeout });
			collector.on("collect", async (btnInteraction) => {
				btnInteraction.deferUpdate();

				if (btnInteraction.customId === "next") {
					// next button pressed
					this.embeds = [this.pages.nextPage()!];
				} else if (btnInteraction.customId === "previous") {
					// prev button pressed
					this.embeds = [this.pages.previousPage()!];
				} else {
					// page button pressed (not yet implemented in this version)
				}
				message.edit(this);
			});

			collector.on("end", async () => {
				await message.edit({ components: [] });
			});
		}
	}
};

class NextButton extends MessageButton {
	constructor() {
		super();
		this.setCustomId("next");
		this.setLabel("Next ►");
		this.setStyle("SECONDARY");
	}
}

class PrevButton extends MessageButton {
	constructor() {
		super();
		this.setCustomId("previous");
		this.setLabel("◄ Prev");
		this.setStyle("SECONDARY");
	}
}

/**
 * A container for n number of embeds
 * @param embeds n number of embeds
 */
class EmbedChapter implements EmbedPages {
	index: number;
	length: number;
	pages: EmbedPages[];
	level: number;
	thumbnail?: string;
	constructor(...embeds: Embed[]) {
		for (const embed of embeds) {
			this.addPage(embed);
		}

		this.index = 0;
		this.length = 0;
		this.pages = [];
		this.level = 0;
	}

	/**
	 * Set the thumbnail for all embeds added to and in this EmbedChapter
	 * @param url - The url of the thumbnail image
	 */
	setThumbnail(url: string) {
		this.thumbnail = url;
		for (const page of this.pages) {
			page.setThumbnail(this.thumbnail);
		}
	}

	/**
	 * Add an Embed or nest an EmbedChapter as a page of this embed chapter
	 * @param page - The page or chapter you want to add
	 * @returns this
	 */
	addPage(page: EmbedPages) {
		++this.length;
		this.pages.push(page);
		if (page instanceof EmbedChapter) {
			page.updateLevel();
		}
		if (this.thumbnail) page.setThumbnail(this.thumbnail);
		return this;
	}

	/**
	 * Return the next page, or `null` if on the last page and not the top level chapter. If top level chapter wrap around to the beginning again.
	 * @returns The next page, taking all page hierarchies into account
	 */
	nextPage() {
		const page = this.pages[this.index].nextPage();
		if (page === null) {
			this.index = (this.index + 1) % this.pages.length;
			if (this.level !== 0 && this.index === 0) {
				return null;
			}
			return this.pages[this.index].firstPage();
		}
		return page;
	}

	/**
	 * Return the previous page, or `null` if on the first page and not the top level chapter. If top level chapter wrap around to the back again.
	 * @returns The previous page, taking all hierarchies into account, or null
	 */
	previousPage() {
		const page = this.pages[this.index].previousPage();
		if (page === null) {
			if ( this.level !== 0 && this.index === 0) {
				return null;
			}
			this.index = (this.index + this.pages.length - 1) % this.pages.length;
			return this.pages[this.index].lastPage();
		}
		return page;
	}

	/**
	 * Return the first page and set the index to 0
	 * @returns - THe first page of this chapter, taking all hierarchies into account
	 */
	firstPage() {
		this.index = 0;
		return this.pages[0].firstPage();
	}

	/**
	 * Return the first page and set the index to the last element
	 * @returns - THe last page of this chapter, taking all hierarchies into account
	 */
	lastPage() {
		this.index = this.pages.length - 1;
		return this.pages.at(-1)?.lastPage() || null;
	}

	/**
	 * Update the hierarchy level of the chapter
	 * IF THIS IS CALLED IT MEANS THIS CHAPTER IS INSIDE ANOTHER CHAPTER
	 */
	updateLevel() {
		if (++this.level >= 4) {
			throw new RangeError("Maximum number of chapter layers exceeded (4)");
		}
		for (const i of this.pages.slice(1)) {
			if (i instanceof EmbedChapter) {
				i.updateLevel();
			}
		}
	}
}