import { Message } from "discord.js";
import Embed from "../../utility/Embed.js";
import MessageObject from "../../utility/MessageObject.js";
import { Command } from "../../types";

const pageIds = [
	"924617485829943376",
	"924617486035451934",
	"924617486232600666",
	"924617486480076806",
	"924617486719127582",
	"924617484441628732",
	"924617484777193492",
	"924617485116907531",
	"924617485330833438",
	"924617485595070494",
	"924617569644720138"
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
		for (let i = 0; i < pageIds.length; ++i) {
			const embed = new Embed();
			embed.setImage(`https://cdn.discordapp.com/attachments/844148161647476756/${pageIds[i]}/page${i}.png`);
			embed.setFooter(`page ${i + 1} of ${pageIds.length}`);
			message.addPage(embed);
		}
		message.watchMessage(await interaction.followUp(message) as Message);
	},
};