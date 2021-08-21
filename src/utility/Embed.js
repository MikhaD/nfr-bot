const { MessageEmbed, Collection, MessageActionRow, MessageButton } = require("discord.js");
const config = require("../config.json");

module.exports = class Embed extends MessageEmbed {
	/**
	 * Multi page supporting embed object with optional next buttons
	 * @param {String} title The title of the embed
	 * @param {String} description The description of the embed
	 */
	constructor(title, description) {
		super();

		this.pages = new Collection();
		this.currentPage = 0;
		this.nextButton = false;
		this.setReturnToInitialPage(true);
		this.buttonsTimeout = 300000;
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
	 * @param {String} name The internal name for this page (cannot be "initial")
	 * @param {MessageEmbed} embed The embed to use as this page
	 */
	addPage(name, embed) {
		this.pageNames.push(name);
		this.pages.set(name, embed);
	}

	/**
	 * Determine whether the initial state of the embed should be returned to after cycling through the other states, true by defualt
	 * @param {Boolean} bool false to disable
	 */
	setReturnToInitialPage(bool) {
		this.returnToInitialPage = bool;
		if (bool && this.pages.get("initial") === undefined) {
			this.pageNames.unshift("initial");
			this.pages.set("initial", this);
		} else if (!this.pages.get("initial")) {
			this.pageNames.shift();
			this.pages.delete("initial");
		}
	}

	setButtonsTimeout(seconds) {
		this.buttonsTimeout = seconds * 1000;
	}

	/**
	 * Return a MessageOptions object containing this embed
	 * @param {Boolean} buttons Add a button for each page if there are multiple pages, for a maximum of 5 pages, otherwise add a next page and previous page button. If true setMessageObject MUST be called on the message the embed was sent in
	 * @param {Boolean} forceNextButton Use next page and previous page buttons even if there are 5 or fewer pages
	 */
	getMessageOptionsObject(buttons, forceNextButton) {
		const obj = {embeds: [this]};
		if (buttons) {
			const row = new MessageActionRow();
			if (forceNextButton || this.pages.size > 5) {
				this.nextButton = true;
				row.addComponents(new MessageButton()
					.setCustomId("previous")
					.setLabel("◄ Prev")
					.setStyle("SECONDARY"),
				new MessageButton()
					.setCustomId("next")
					.setLabel("Next ►")
					.setStyle("SECONDARY")
				);
			} else {
				const btns = [];
				for (const emb of this.pageNames) {
					btns.push(new MessageButton()
						.setCustomId(emb)
						.setLabel(emb)
						.setStyle("PRIMARY")
					);
				}
				row.addComponents(btns);
			}
			obj.components = [row];
		}
		return obj;
	}

	setMessageObject(message) {
		let firstInteraction = true;

		const collector = message.channel.createMessageComponentCollector({ componentType: "BUTTON", time: 10000, message });
		collector.on("collect", async (btnInteraction) => {
			btnInteraction.deferUpdate();
			if (this.nextButton) {
				if (btnInteraction.customId === "next") {
					if (this.returnToInitialPage || !firstInteraction) {
						++this.currentPage;
						firstInteraction = false;
					}
					this.currentPage = this.currentPage % this.pageNames.length;
					await message.edit({embeds: [this.page(this.pageNames[this.currentPage])] });
				} else {
					this.currentPage = (this.currentPage + this.pageNames.length - 1) % this.pageNames.length;
					await message.edit({embeds: [this.page(this.pageNames[this.currentPage])] });
				}
			} else {
				await message.edit({embeds: [this.page(btnInteraction.customId)] });
			}
		});

		collector.on("end", async (btnInteraction) => {
			await message.edit({ components: [] });
		});
	}
};