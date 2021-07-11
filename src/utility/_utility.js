const config = require("../config.json");
const { MessageEmbed } = require("discord.js");
const { createCanvas, loadImage } = require("canvas");
const { writeFileSync } = require("fs");

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

/**
 * Make an array of permissions into a human friendly string
 * @param {array} permsArray - Array of permissions
 * @returns Comma seperated list of permissions
 */
module.exports.parsePermissions = function(permsArray) {
	permsArray = permsArray.toString().replace(",", ", ");
	return permsArray;
};

/**
 * A class representing a color constructed from a hexadecimal string
 * @param string A hexadecimal string representing a color
 */
module.exports.Color = class Color {
	constructor(hexString) {
		/** multiplier */
		let x = (hexString.length > 4) ? 2 : 1;
		if (hexString.startsWith("#")) hexString = hexString.slice(1);
		this.r = parseInt(hexString.slice(0, x * 1), 16);
		this.g = parseInt(hexString.slice(x * 1, x * 2), 16);
		this.b = parseInt(hexString.slice(x * 2, x * 3), 16);
		this.a = (hexString.length / x === 4) ? parseInt(hexString.slice(x * 3), 16) / 255 : 1;
	}

	rgb() { return `rgb(${this.r}, ${this.g}, ${this.b})`; }

	rgbArray() { return [this.r, this.g, this.b]; }

	rgba() { return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`; }

	rgbaArray() { return [this.r, this.g, this.b, this.a]; }

	withAlpha(alpha) { return `rgba(${this.r}, ${this.g}, ${this.b}, ${alpha})`; }
};

module.exports.colors = {
	white: new exports.Color("#F9FFFE"),
	light_gray: new exports.Color("#9D9D97"),
	gray: new exports.Color("#474F52"),
	black: new exports.Color("#1D1D21"),
	yellow: new exports.Color("#FED83D"),
	orange: new exports.Color("#F9801D"),
	red: new exports.Color("#B02E26"),
	brown: new exports.Color("#835432"),
	lime: new exports.Color("#80C71F"),
	green: new exports.Color("#5E7C16"),
	light_blue: new exports.Color("#3AB3DA"),
	cyan: new exports.Color("#169C9C"),
	blue: new exports.Color("#3C44AA"),
	pink: new exports.Color("#F38BAA"),
	magenta: new exports.Color("#C74EBD"),
	purple: new exports.Color("#8932B8")
};

module.exports.createBannerImage = async function(data, path) {
	const canvas = createCanvas(20, 40);
	const ctx = canvas.getContext("2d");

	ctx.fillStyle = exports.colors[data.base.toLowerCase()].rgb();
	ctx.fillRect(0, 0, 20, 40);

	for (let layer of data.layers) {
		let tempCanv = createCanvas(20, 40);
		let tempCtx = tempCanv.getContext("2d");
		let img = await loadImage(`./src/images/banners/patterns/${layer.pattern.toLowerCase()}.png`);
		tempCtx.drawImage(img, 0, 0, 20, 40);

		let imgData = tempCtx.getImageData(0, 0, 20, 40);
		for (let i = 0; i < imgData.data.length; i+=4) {
			imgData.data.set([...exports.colors[layer.colour.toLowerCase()].rgbArray()], i);
		}
		tempCtx.putImageData(imgData, 0, 0);
		img = await loadImage(tempCanv.toBuffer("image/png"));
		ctx.drawImage(img, 0, 0, 20, 40);
	}
	writeFileSync(path, canvas.toBuffer("image/png"));
};

module.exports.fetchGuild = async function(name) {
	let guildData = await fetch(
		`https://api.wynncraft.com/public_api.php?action=guildStats&command=${name}`
	);
	return await guildData.json();
};

module.exports.fetchPlayer = async function(name) {
	let playerData = await fetch(
		`https://api.wynncraft.com/v2/player/${name}/stats`
	);
	return await playerData.json();
};