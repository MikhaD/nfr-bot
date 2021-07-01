const config = require("../../config.json");
const { randint } = require("../utility/_utility");

module.exports = {
	name: "roll",
	args: {
		optional: ["dice sides"]
	},
	description: "Roll a dice with x number of sides",
	example: "roll 20",

	execute(msg, args) {
		let sides = config.defualt_dice;
		if (args.length > 0 && !isNaN(args[0])) {
			sides = Math.floor(args[0]);
		}

		msg.channel.send(randint(sides) + 1);
	}
};