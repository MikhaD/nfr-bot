import { CommandInteraction, Message } from "discord.js";
import { Command } from "../../types";
import Embed from "../../utility/Embed";
import MessageObject from "../../utility/MessageObject";

export const command: Command = {
	name: "test",
	description: "test editing reply with different embed",
	ephemeral: true,
	perms: ["ADMINISTRATOR"],
	cooldown: 0,
	options: [{
		name: "fields",
		type: "INTEGER",
		description: "the number of fields in the embed",
		required: true
	}],

	async execute(interaction: CommandInteraction) {
		const message = new MessageObject("Hello!");
		let embed = new Embed("test title", "test description", true);
		let embed2 = new Embed("Number 2", "test description");
		for (let i = 0; i < interaction.options.getInteger("fields")!; ++i) {
			embed.addField(`field title ${i}`, `${i}`);
			embed2.addField(`#2 title ${i}`, `${i}`);
		}
		message.addPage(embed);
		message.addPage(embed2);
		message.addPage(new Embed("PAGE 3", "hello :)"));

		message.watchMessage(await interaction.followUp(message) as Message);
	}
};