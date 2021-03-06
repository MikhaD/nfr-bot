import { Command } from "../../types";

import { randint } from "../../utility/utility.js";
import config from "../../config.js";

export const command: Command = {
	name: "roll",
	description: "Roll a dice with x number of sides, 6 by default",
	ephemeral: false,
	perms: [],
	cooldown: 0,
	options: [{
		name: "sides",
		type: "INTEGER",
		description: "The number of sides on the die",
		required: false
	}],

	async execute(interaction) {
		const sides = interaction.options.getInteger("sides") || config.defualt_dice;
		await interaction.followUp(`${randint(sides) + 1}`);
	},
};