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
	}

	addPage(page) {
		++this.length;
		this.pages.push(page);
		if (page instanceof EmbedChapter) {
			page.updateLevel();
		}
		return this;
	}

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

	firstPage() {
		return this.pages[0].firstPage();
	}

	lastPage() {
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