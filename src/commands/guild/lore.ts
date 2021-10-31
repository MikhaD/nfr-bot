import { Message } from "discord.js";
import Embed from "../../utility/Embed.js";
import MessageObject from "../../utility/MessageObject.js";
import { Command } from "../../types";

const pages = [
	"901946411325739058/cover",
	"901946418078576680/page1",
	"901946421513703454/page2",
	"901946420309921832/page3",
	"901946426697850941/page4",
	"901946425389236304/page5",
	"901946429390598174/page6",
	"901946433429700619/page7",
	"901946469983092808/page8",
	"901946477356650496/page9",
	"901946481802641428/page10"
];

export const command: Command = {
	name: "lore",
	description: "The story of how NFR came to be, written by Fate, edited by Hiro & illustrated by MrRussetPotato",
	ephemeral: false,
	perms: [],
	cooldown: 60,
	server: "739428526431666237",
	options: [],

	async execute(interaction) {
		const message = new MessageObject();
		for (let i = 0; i < pages.length; ++i) {
			const embed = new Embed();
			embed.setImage(`https://media.discordapp.net/attachments/844148161647476756/${pages[i]}.png`);
			embed.setFooter(`page ${i + 1} of ${pages.length}`);
			message.addPage(embed);
		}
		message.watchMessage(await interaction.followUp(message) as Message);
	},
};