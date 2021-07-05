const config = require("../../config.json");
const {MessageEmbed} = require("discord.js");

/**
 * Set all arguments to either the provided argument, or the default if one is not provided
 * @param {array} defaults - Default values for the arguments
 * @param {array} args - User values for the arguments
 * @returns an array of arguments
 */
module.exports.setDefaultArgs = function(defaults, args) {
	let result = [];
	for (let i in defaults) {
		result.push((args.length >= i + 1) ? args[i] : defaults[i]);
	}
	return result;
};

/**
 * Create a standard simple embed (default highlight)
 * @param {string} title - The embed's title
 * @param {string} text - The embed's text
 * @returns a Discord.MessageEmbed object
 */
module.exports.createSimpleEmbed = function(title, text) {
	return new MessageEmbed()
		.setTitle(title)
		.setDescription(text)
		.setColor(config.embed.colors.default);
};

/**
 * Create a standard warning embed (orange highlight)
 * @param {string} title - The embed's title
 * @param {string} text - The embed's text
 * @returns a Discord.MessageEmbed object
 */
module.exports.createWarnEmbed = function(title, text) {
	let result = new module.exports.createSimpleEmbed(title, text);
	result.setColor(config.embed.colors.warn);
	return result;
};

/**
 * Create a standard error embed (red highlight)
 * @param {string} title - The embed's title
 * @param {string} text - The embed's text
 * @returns a Discord.MessageEmbed object
 */
module.exports.createErrorEmbed = function(title, text) {
	let result = new module.exports.createSimpleEmbed(title, text);
	result.setColor(config.embed.colors.error);
	return result;
};

/**
 * Parse a command's arguments into a string
 * @param {Object} command - The command object to parse the arguments for
 * @returns Argument String
 */
module.exports.parseArguments = function(command) {
	let result = "";
	if (command.args) {
		if (command.args.required) {
			for (let arg of command.args.required) {
				result += `<${arg}> `;
			}
		}
		if (command.args.optional) {
			result += "[";
			for (let arg of command.args.optional) {
				result += `${arg}, `;
			}
			result = `${result.slice(0, -2)}]`;
		}
	}
	return result;
};

/**
 * Generate a random integer between 0 and max (exclusive)
 * @param {Number} max - The upper limit (exclusive)
 * @returns {Number} A number between 0 and max
 */
module.exports.randint = function(max) {
	return Math.floor((max*Math.random()));
};


module.exports.parsePermissions = function(permsArray) {
	permsArray = permsArray.toString().replace(",", ", ");
	return permsArray;
};