const EmbedChapter = require("./EmbedChapter");
const { MessageButton, MessageActionRow } = require("discord.js");

module.exports = class MessageObject {
	constructor(text) {
		this.pages = new EmbedChapter();
		this.embeds = [];
		this.components = [];
		this.buttonsTimeout = 300000;
		if (text) this.content = text;
	}

	/**
	 * Pages should only be added once they have had all of their own pages added to them, otherwise there will be inconsistancies
	 * @param {Object} page - Either an Embed or an EmbedChapter
	 */
	addPage(page) {
		this.pages.addPage(page);
		if (this.pages.length === 1) {
			this.embeds.push(this.pages.firstPage());
		}
		if ((this.pages.length > 1 || page.pages.length > 1) && this.components.length === 0) {
			this.components = [new MessageActionRow().addComponents(new PrevButton(), new NextButton)];
		}
	}

	setMessage(message) {
		this.message = message;

		const collector = message.channel.createMessageComponentCollector({ componentType: "BUTTON", time: this.buttonsTimeout, message });
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