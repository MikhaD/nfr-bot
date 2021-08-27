const { MessageEmbed, Collection, MessageActionRow, MessageButton, Message } = require("discord.js");
const config = require("../config.json");

module.exports = class Embed extends MessageEmbed {
	/**
	 * Multi page supporting embed object with optional next buttons
	 * @param {String} title The title of the embed
	 * @param {String} description The description of the embed
	 */
	constructor(title, description, name, emoji) {
		super();
		this.name = name || "initial";
		this.emoji = emoji || "";
		this.pages = {
			standard: {index: 0, names: [this.name], pages: [this]},
			internal: {index: 0, pages: [this]}
		};
		this.fieldCount = 0;

		this.buttons = [];
		this.buttonsTimeout = 300000;

		this.returnToInitialPage = true;
		this.setTitle(`${title}`);
		this.setDescription(`${description}`);
		this.setColor(config.colors.embed.default);
	}

	/**
	 * Set the name of this embed. DO NOT add pages before setting the name of the embed
	 * @param {String} name The name of this embed
	 * @param {String} emoji Optional: The name or id of an emoji for the button for this embed
	 */
	setName(name, emoji) {
		this.name = name;
		if (emoji) this.emoji = emoji;
	}

	/**
	 * Return the embed page with the given name, or the internal page with the given mumber
	 * @param page - The name of the page to return, or the number of the internal page to return
	 * @returns the MessageEmbed with the given name or number, or undefined if it doesn't exist
	 */
	page(page) {
		try {
			if (isNaN(page)) {
				return this.pages.standard.pages[this.pages.standard.names.indexOf(page)];
			} else {
				return this.pages.internal.pages[parseInt(page)];
			}
		} catch {
			return undefined;
		}
	}

	/**
	 * Add a page to this embed
	 * @param {MessageEmbed} embed The embed to use as this page
	 * @param {boolean} inherit Whether the embed should inherit the color & thumbnail of the parent, true by default
	 */
	addPage(embed, inherit) {
		embed.pages.standard.pages = [embed, ...this.pages.standard.pages];
		embed.pages.standard.names = [embed.name, ...this.pages.standard.names];
		embed.buttons = [standardButton(this), ...this.buttons];
		// set buttons of new embed
		// add the new embed to the buttons and pages etc of this embed after doing so for all the other pages.
		let pages = this.returnToInitialPage ? this.pages.standard.pages.slice(1) : this.pages.standard.pages;
		for (const page of pages) {
			page.pages.standard.names.push(embed.name);
			page.pages.standard.pages.push(embed);
			page.buttons.push(standardButton(embed));
		}
		this.pages.standard.names.push(embed.name);
		this.pages.standard.pages.push(embed);
		this.buttons.push(standardButton(embed));

		if (inherit !== false) {
			if (this.thumbnail) embed.setThumbnail(this.thumbnail.url);
			embed.setColor(this.color);
		}
	}

	/**
	 * Don't return to the initial state of the embed after cycling through the other states
	 */
	disableReturnToInitialPage() {
		if (this.returnToInitialPage) {
			this.returnToInitialPage = false;
			this.pages.standard.names.shift();
			this.pages.standard.pages.shift();
			this.pages.internal.pages.shift();
		}
	}

	/**
	 * Set the number of seconds for the embeds navigation buttons to persist for
	 * @param {Integer} seconds The number of seconds before the message navigation buttons dissapear
	 */
	setButtonsTimeout(seconds) {
		this.buttonsTimeout = seconds * 1000;
	}

	addField(title, text, inline) {
		const maxPages = 25;
		++this.fieldCount;
		if (this.fieldCount > 1 && this.fieldCount % maxPages === 1) {
			const emb = new Embed("", "").setColor(this.color);
			if (this.thumbnail) emb.setThumbnail(this.thumbnail.url);
			this.pages.internal.pages.push(emb);
		}
		if (this.fieldCount > maxPages) {
			this.pages.internal.pages.slice(-1)[0].addField(title, text, inline);
		} else {
			super.addField(title, text, inline);
		}
	}

	/**
	 * Whether the embed uses next buttons (as apposed to page buttons)
	 * @returns true if next buttons are used, else false
	 */
	nextButton() {
		return this.forceNextButton || (this.pages.standard.pages.length >= 5 && this.pages.internal.pages.length > 1) || this.pages.standard.pages.length > 5;
	}

	/**
	 * Return a MessageOptions object containing this embed. This should be called after embed is finished
	 * @param {Boolean} buttons Add a button for each page if there are multiple pages, for a maximum of 5 pages, otherwise add a next page and previous page button. If true setMessageObject MUST be called on the message the embed was sent in
	 * @param {Boolean} forceNextButton Use next page and previous page buttons even if there are 5 or fewer pages
	 */
	getMessageOptionsObject(buttons, forceNextButton) {
		this.forceNextButton = forceNextButton;
		const obj = {embeds: [this]};
		if (buttons) {
			if (this.nextButton()) {
				this.buttons = [prevButton(), nextButton()];
			} else {
				if (this.pages.internal.pages.length > 1 && this.returnToInitialPage) {
					this.buttons.unshift(nextButton());
					this.buttons.unshift(prevButton());
				}
			}
			obj.components = [new MessageActionRow().addComponents(this.buttons)];
		}
		return obj;
	}

	/**
	 * Set the message that will be edited as a reaction to button presses
	 * @param {Message} message - The message with the buttons
	 */
	setMessageObject(message) {

		const collector = message.channel.createMessageComponentCollector({ componentType: "BUTTON", time: this.buttonsTimeout, message });
		collector.on("collect", async (btnInteraction) => {
			btnInteraction.deferUpdate();

			if (btnInteraction.customId === "next") {
				this.pages.internal.index = ++this.pages.internal.index % this.pages.internal.pages.length;
				await message.edit({embeds: [this.page(this.pages.internal.index)]});
			} else if (btnInteraction.customId === "previous") {
				this.pages.internal.index = (this.pages.internal.index + this.pages.internal.pages.length - 1) % this.pages.internal.pages.length;
				await message.edit({embeds: [this.page(this.pages.internal.index)]});
			} else {
				const page = this.page(btnInteraction.customId);
				const msg = {embeds: [page]};
				if (!this.nextButton()) {
					msg.components = [new MessageActionRow().addComponents(page.buttons)];
				}
				await message.edit(msg);
			}
		});

		collector.on("end", async () => {
			await message.edit({ components: [] });
		});
	}
};

function nextButton() {
	return new MessageButton()
		.setCustomId("next")
		.setLabel("Next ►")
		.setStyle("SECONDARY");
}

function prevButton() {
	return new MessageButton()
		.setCustomId("previous")
		.setLabel("◄ Prev")
		.setStyle("SECONDARY");
}

function standardButton(embed) {
	const btn = new MessageButton()
		.setCustomId(embed.name)
		.setLabel(embed.name)
		.setStyle("PRIMARY");
	if (embed.emoji !== "") {
		btn.setEmoji(embed.emoji);
	}
	return btn;
}