const path = require("path");
const { randint } = require(path.join(__dirname, "../../utility/utility"));
const config = require(path.join(__dirname, "../../config.json"));

module.exports = {
	name: "roll",
	description: "Roll a dice with x number of sides, 6 by default",
	options: [{
		name: "sides",
		type: "INTEGER",
		description: "The number of sides on the die",
		required: false
	}],
	execute(interaction) {
		const sides = interaction.options.getInteger("sides");
		interaction.followUp(`${randint(sides ? sides : config.defualt_dice) + 1}`);
	}
};