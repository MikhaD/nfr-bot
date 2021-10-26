// eslint-disable-next-line no-unused-vars
const { Embed } = require("./Embed");

module.exports = class EmbedChapter {
	/**
	 * Takes an array of embeds, or embed, embed, embed etc.
	 */
	constructor() {
		if (arguments.length === 1 && Array.isArray(arguments[0])) {
			for (const embed of arguments[0]) {
				this.addPage(embed);
			}
		} else {
			for (const i of arguments) {
				this.addPage(i);
			}
		}
		this.index = 0;
		this.length = 0;
		this.pages = [];
		this.level = 0;
		this.thumbnail = null;
	}

	/**
	 * Set the thumbnail for all embeds added to and in this EmbedChapter
	 * @param {string} url - The url of the thumbnail image
	 */
	setThumbnail(url) {
		this.thumbnail = url;
		for (const page of this.pages) {
			page.setThumbnail(this.thumbnail);
		}
	}

	/**
	 * Add an Embed or nest an EmbedChapter as a page of this embed chapter
	 * @param {Embed | EmbedChapter} page - The page you want to add
	 * @returns this
	 */
	addPage(page) {
		++this.length;
		this.pages.push(page);
		if (page instanceof EmbedChapter) {
			page.updateLevel();
		}
		if (this.thumbnail) {
			page.setThumbnail(this.thumbnail);
		}
		return this;
	}

	/**
	 * Return the next page, or `null` if on the last page and not the top level chapter. If top level chapter wrap around to the beginning again.
	 * @returns {Embed} The next page, taking all page hierarchies into account
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
	 * @returns {Embed} The previous page, taking all hierarchies into account, or null
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
	 * @returns {Embed} - THe first page of this chapter, taking all hierarchies into account
	 */
	firstPage() {
		this.index = 0;
		return this.pages[0].firstPage();
	}

	/**
	 * Return the first page and set the index to the last element
	 * @returns {Embed} - THe last page of this chapter, taking all hierarchies into account
	 */
	lastPage() {
		this.index = this.pages.length - 1;
		return this.pages.at(-1).lastPage();
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
};