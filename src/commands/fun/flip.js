module.exports = {
	name: "flip",
	args: {},
	description: "flip a 50/50 coin.",
	example: "flip",

	/*eslint no-unused-vars: "off"*/
	execute(msg, args) {
		msg.channel.send((Math.random() >= 0.5) ? "heads" : "tails");
	}
};