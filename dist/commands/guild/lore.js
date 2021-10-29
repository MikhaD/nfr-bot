"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const Embed_1 = __importDefault(require("../../utility/Embed"));
const MessageObject_1 = __importDefault(require("../../utility/MessageObject"));
const pages = [
    "https://media.discordapp.net/attachments/844148161647476756/901946411325739058/cover.png",
    "https://media.discordapp.net/attachments/844148161647476756/901946418078576680/page1.png",
    "https://media.discordapp.net/attachments/844148161647476756/901946421513703454/page2.png",
    "https://media.discordapp.net/attachments/844148161647476756/901946420309921832/page3.png",
    "https://media.discordapp.net/attachments/844148161647476756/901946426697850941/page4.png",
    "https://media.discordapp.net/attachments/844148161647476756/901946425389236304/page5.png",
    "https://media.discordapp.net/attachments/844148161647476756/901946429390598174/page6.png",
    "https://media.discordapp.net/attachments/844148161647476756/901946433429700619/page7.png",
    "https://media.discordapp.net/attachments/844148161647476756/901946469983092808/page8.png",
    "https://media.discordapp.net/attachments/844148161647476756/901946477356650496/page9.png",
    "https://media.discordapp.net/attachments/844148161647476756/901946481802641428/page10.png"
];
exports.command = {
    name: "lore",
    description: "The story of how NFR came to be, written by Fate, edited by Hiro & illustrated by MrRussetPotato",
    ephemeral: false,
    perms: [],
    cooldown: 60,
    server: "739428526431666237",
    options: [],
    async execute(interaction) {
        const message = new MessageObject_1.default();
        for (let i = 0; i < pages.length; ++i) {
            const embed = new Embed_1.default();
            embed.setImage(pages[i]);
            embed.setFooter(`page ${i + 1} of ${pages.length}`);
            message.addPage(embed);
        }
        message.watchMessage(await interaction.followUp(message));
    },
};
