import { MessageEmbed } from "discord.js";
import config from "../config.js";
export default class Embed extends MessageEmbed {
    index;
    fieldCount;
    pages;
    embeds;
    pageNumbersOn;
    constructor(title = "", description = "", pageNumbersOn = false) {
        super();
        this.setTitle(`${title}`);
        this.setDescription(`${description}`);
        this.setColor(config.colors.embed.default);
        this.index = 0;
        this.fieldCount = 0;
        this.pages = [this];
        this.embeds = [this];
        this.pageNumbersOn = pageNumbersOn;
    }
    addField(title = "\u200b", text = "\u200b", inline = false) {
        const maxFields = 25;
        ++this.fieldCount;
        if (this.fieldCount > 1 && this.fieldCount % maxFields === 1) {
            const emb = new MessageEmbed();
            if (this.color)
                emb.setColor(this.color);
            if (this.thumbnail)
                emb.setThumbnail(this.thumbnail.url);
            this.pages.push(emb);
            if (this.pageNumbersOn)
                this.pageNumbers(true);
        }
        if (this.fieldCount > maxFields) {
            this.pages.at(-1)?.addField(title, text, inline);
        }
        else {
            super.addField(title, text, inline);
        }
        return this;
    }
    setThumbnail(url) {
        super.setThumbnail(url);
        for (const page of this.pages.slice(1)) {
            page.setThumbnail(url);
        }
        return this;
    }
    pageNumbers(pageNumbersOn) {
        this.pageNumbersOn = pageNumbersOn;
        if (this.pages.length > 1) {
            for (let i = 0; i < this.pages.length; ++i) {
                this.pages[i].setFooter(pageNumbersOn ? `${i + 1} of ${this.pages.length}` : "");
            }
        }
        return this;
    }
    nextPage() {
        if (++this.index >= this.pages.length) {
            this.index = 0;
            return null;
        }
        else {
            return this.pages[this.index];
        }
    }
    previousPage() {
        if (this.index === 0) {
            return null;
        }
        return this.pages[--this.index];
    }
    firstPage() {
        this.index = 0;
        return this;
    }
    lastPage() {
        this.index = this.pages.length - 1;
        return this.pages.at(-1) || null;
    }
}
export class SuccessEmbed extends Embed {
    constructor(title = "", description = "") {
        super(title, description);
        this.setColor(config.colors.embed.success);
    }
}
export class WarnEmbed extends Embed {
    constructor(title = "", description = "") {
        super(title, description);
        this.setColor(config.colors.embed.warn);
    }
}
export class ErrorEmbed extends Embed {
    constructor(title = "", description = "") {
        super(title, description);
        this.setColor(config.colors.embed.error);
    }
}
