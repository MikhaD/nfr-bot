module.exports = {
	// Delete any unused properties, with the exception of args, which, in the case of no args is just args: {} 
	name: "",
	aliases: [""],
	args: {
		required: [""],
		optional: [""]
	},
	description: "",
	example: "",
	serverOnly: true,
	cooldown: 5,
	permissions: [""],

	execute(msg, args) {
		return [msg, args];
	}
};