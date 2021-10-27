import EmbedChapter from "./EmbedChapter";
import { MessageButton, MessageActionRow, MessageEmbed, FileOptions, BufferResolvable, MessageAttachment, Message, MessageEditOptions, MessageOptions } from "discord.js";
import Embed from "./Embed";
import { EmbedPages } from "../types";

export default class MessageObject implements MessageEditOptions, MessageOptions {
	content: string;
	pages: EmbedChapter;
	embeds: MessageEmbed[];
	components: MessageActionRow[];
	attachments: MessageAttachment[];
	buttonsTimeout: number;
	thumbnail?: string;

	constructor(text="") {
		this.content = text;
		this.pages = new EmbedChapter();
		this.embeds = [];
		this.components = [];
		this.attachments = [];
		this.buttonsTimeout = 5 * 60 * 1000;
	}

	/**
	 * Pages should only be added once they have had all of their own pages added to them, otherwise there will be inconsistancies
	 * @param {Embed | EmbedChapter} page - Either an Embed or an EmbedChapter
	 * @returns this
	 */
	addPage(page: EmbedPages) {
		this.pages.addPage(page);
		if (this.pages.length === 1) {
			this.embeds.push(this.pages.firstPage());
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
			//! is the message option required to make this work properly?
			const collector = message.channel.createMessageComponentCollector({ componentType: "BUTTON", time: this.buttonsTimeout });
			collector.on("collect", async (btnInteraction) => {
				btnInteraction.deferUpdate();

				if (btnInteraction.customId === "next") {
					// next button pressed
					this.embeds = [this.pages.nextPage()];
				} else if (btnInteraction.customId === "previous") {
					// prev button pressed
					this.embeds = [this.pages.previousPage()];
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