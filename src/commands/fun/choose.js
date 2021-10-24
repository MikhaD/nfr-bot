const path = require("path");
const { randint } = require(path.join(__dirname, "../../utility/utility"));

module.exports = {
	name: "choose",
	aliases: ["pick"],
	args: {
		optional: ["option1", "option2", "option3", "..."]
	},
	description: "Choose one of the provided options at random",
	example: "choose him her them 'no one'",

	execute(msg, args) {
		if (!args.length) {
			msg.channel.send(`You didn't specify any options to choose from, so I choose you ${msg.author}`);
		} else {
			//info ###### combine groups of args that start and end in inverted commas into single args ######
			let comma = "";
			let newArgs = [];
			let str = "";
			args = args.join(" ");

			for (let i = 0; i < args.length; ++i) {
				if (!comma) {
					if (["'", "\""].includes(args[i]) || args[i] === " ") {
						if (["'", "\""].includes(args[i])) {
							comma = args[i];
						}
						(str !== "") ? newArgs.push(str) : false;
						str = "";
					} else {
						str += args[i];
					}
				} else {
					if (args[i] === comma) {
						(str !== "") ? newArgs.push(str) : false;
						str = "";
						comma = "";
					} else {
						str += args[i];
					}
				}
			}
			(str !== "") ? newArgs.push(str) : false;

			//info ########################### choose and return a random argument ###########################
			msg.channel.send(newArgs[randint(newArgs.length)]);
		}
	}
};