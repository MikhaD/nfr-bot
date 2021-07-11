const { randint } = require("../utility/_utility");

module.exports = {
	name: "choose",
	aliases: ["pick"],
	args: {
		optional: ["option 1", "option 2", "option 3", "..."]
	},
	description: "Choose one of the provided options at random",
	example: "choose him her them 'no one'",

	execute(msg, args) {
		if (!args.length) {
			msg.channel.send(`You didn't specify any options to choose from, so I choose you ${msg.author}`);
		} else {
			//i ######## combine groups of args that start and end in inverted commas into single args #######
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

			//i ############################# choose and return a random argument ############################
			let choice = randint(newArgs.length);
			msg.channel.send(newArgs[choice]);
		}
	}
};