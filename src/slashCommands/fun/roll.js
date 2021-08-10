const path = require("path");
const { randint } = require(path.join(__dirname, "../../utility/utility"));

module.exports = {
	name: "roll",
	description: "Roll a dice with x number of sides, 6 by default",
	options: [{
		name: "sides",
		type: "INTEGER",
		description: "The number of sides on the die",
		required: false
	}],
	example: "roll 20",
	execute(interaction) {
		// interaction.followUp(`${randint(sides) + 1}`);
		interaction.followUp(`${interaction.options.array()}`);
	}
};