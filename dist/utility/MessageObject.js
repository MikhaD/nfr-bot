import { MessageButton, MessageActionRow } from "discord.js";
export default class MessageObject {
    content;
    pages;
    embeds;
    components;
    attachments;
    buttonsTimeout;
    thumbnail;
    constructor(text) {
        if (text)
            this.content = text;
        this.pages = new EmbedChapter();
        this.embeds = [];
        this.components = [];
        this.attachments = [];
        this.buttonsTimeout = 5 * 60 * 1000;
    }
    addPage(page) {
        this.pages.addPage(page);
        if (this.pages.length === 1) {
            this.embeds.push(this.pages.firstPage());
        }
        if ((this.pages.length > 1 || page.pages.length > 1) && this.components.length === 0) {
            this.components = [new MessageActionRow().addComponents(new PrevButton(), new NextButton)];
        }
        return this;
    }
    setThumbnail(thumbnail) {
        if (typeof thumbnail === "string") {
            this.thumbnail = thumbnail;
        }
        else {
            this.thumbnail = `attachment://${thumbnail.name}`;
            this.attachments.push(thumbnail);
        }
        this.pages.setThumbnail(this.thumbnail);
    }
    watchMessage(message) {
        if (this.pages.length > 1) {
            const collector = message.createMessageComponentCollector({ componentType: "BUTTON", time: this.buttonsTimeout });
            collector.on("collect", async (btnInteraction) => {
                btnInteraction.deferUpdate();
                if (btnInteraction.customId === "next") {
                    this.embeds = [this.pages.nextPage()];
                }
                else if (btnInteraction.customId === "previous") {
                    this.embeds = [this.pages.previousPage()];
                }
                else {
                }
                message.edit(this);
            });
            collector.on("end", async () => {
                await message.edit({ components: [] });
            });
        }
    }
}
;
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
class EmbedChapter {
    index;
    length;
    pages;
    level;
    thumbnail;
    constructor(...embeds) {
        for (const embed of embeds) {
            this.addPage(embed);
        }
        this.index = 0;
        this.length = 0;
        this.pages = [];
        this.level = 0;
    }
    setThumbnail(url) {
        this.thumbnail = url;
        for (const page of this.pages) {
            page.setThumbnail(this.thumbnail);
        }
    }
    addPage(page) {
        ++this.length;
        this.pages.push(page);
        if (page instanceof EmbedChapter) {
            page.updateLevel();
        }
        if (this.thumbnail)
            page.setThumbnail(this.thumbnail);
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
            if (this.level !== 0 && this.index === 0) {
                return null;
            }
            this.index = (this.index + this.pages.length - 1) % this.pages.length;
            return this.pages[this.index].lastPage();
        }
        return page;
    }
    firstPage() {
        this.index = 0;
        return this.pages[0].firstPage();
    }
    lastPage() {
        this.index = this.pages.length - 1;
        return this.pages.at(-1)?.lastPage() || null;
    }
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
