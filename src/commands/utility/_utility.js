const config = require("../../config.json");
const helpFile = require("../../help.json");
const {MessageEmbed} = require("discord.js");

/**
 * Set all arguments to either the provided argument, or the default if one is not provided
 * @param {array} defaults - Default values for the arguments
 * @param {array} args - User values for the arguments
 * @returns an array of arguments
 */
module.exports.setDefaultArgs = function setArgs(defaults, args) {
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
module.exports.createSimpleEmbed = function createSimpleEmbed(title, text) {
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
module.exports.createWarnEmbed = function createWarnEmbed(title, text) {
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
module.exports.createErrorEmbed = function createErrorEmbed(title, text) {
	let result = new module.exports.createSimpleEmbed(title, text);
	result.setColor(config.embed.colors.error);
	return result;
};

/**
 * Return an object containing the help information for a given command
 * @param {string} command - The command to fetch help information for
 * @returns {*} {"description": ..., "example": ..., "parameters": ...}
 */
module.exports.helpForCommand = function helpForCommand(command) {
	command = command.toLowerCase();
	if (command in helpFile) {
		let result = {};
		result["description"] = helpFile[command].description;
		result["example"] = `${config.prefix}${helpFile[command].example}`;
		result["parameters"] = "";

		if ("parameters" in helpFile[command]) {
			if ("required" in helpFile[command].parameters) {
				for (let i of helpFile[command].parameters.required) {
					result["parameters"] += ` <${i}>`;
				}
			}
			if ("optional" in helpFile[command].parameters) {
				result["parameters"] += " [";
				for (let i of helpFile[command].parameters.optional) {
					result["parameters"] += `${i}, `;
				}
				result["parameters"] = result["parameters"].slice(0, -2) + "]";
			}
		}
		return result;
	} else return null;
};

/**
 * Generate a random integer between 0 and max (exclusive)
 * @param {Number} max - The upper limit (exclusive)
 * @returns {Number} A number between 0 and max
 */
module.exports.randint = function randint(max) {
	return Math.floor((max*Math.random()));
};