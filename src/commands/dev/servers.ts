import { Message } from "discord.js";
import { Command } from "../../types";

import Embed from "../../utility/Embed";
import MessageObject from "../../utility/MessageObject";

export const command: Command = {
	name: "servers",
	description: "Send a list of the servers this bot is currently in",
	ephemeral: true,
	perms: ["ADMINISTRATOR"],
	cooldown: 0,
	options: [],

	async execute(interaction) {
		const embed = new Embed("Bot servers", `This bot is currently in ${interaction.client.guilds.cache.size} server${interaction.client.guilds.cache.size > 1 ? "s" : ""}:`);
		for (const guild of interaction.client.guilds.cache) {
			embed.addField(guild[1].name, `ID: ${guild[1].id}`);
		}
		const message = new MessageObject();
		message.watchMessage(await interaction.followUp(message.addPage(embed)) as Message);
	},
};