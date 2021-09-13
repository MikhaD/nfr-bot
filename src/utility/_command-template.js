module.exports = {
	// Delete any unused properties, with the exception of args, which, in the case of no args is just args: {}
	// Unused boolean properties do not have to be deleted
	name: "",
	aliases: [""],
	args: {
		required: [""],
		optional: [""]
	},
	description: "",
	example: "",
	serverOnly: true,
	dev: false,
	cooldown: 5,
	permissions: ["ADMINISTRATOR"],

	execute(msg, args) {
		return [msg, args];
	}
};