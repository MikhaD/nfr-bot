import { Command } from "../../types";

export const command: Command = {
	name: "flip",
	description: "Flip a 50/50 coin",
	ephemeral: false,
	perms: [],
	cooldown: 0,
	options: [],

	async execute(interaction) {
		await interaction.followUp((Math.random() >= 0.5) ? "heads" : "tails");
	},
};