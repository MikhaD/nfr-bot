module.exports = {
	name: "",
	args: {
		required: [""],
		optional: [""]
	},
	description: "",
	example: "",
	serverOnly: true,
	cooldown: 5,

	execute(msg, args) {
		return [msg, args];
	}
};