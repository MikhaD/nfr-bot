const { createCanvas, loadImage } = require("canvas");
const fetch = require("node-fetch");

/**
 * Parse a command's arguments into a string
 * @param {Object} command - The command object to parse the arguments for
 * @returns {string} Argument string
 */
module.exports.parseArguments = function(command) {
	if (command.options) {
		let required = "";
		let optional = " [";
		for (const option of command.options) {
			if (option.required) {
				required += ` <${option.name}>`;
			} else {
				optional += `${option.name}, `;
			}
		}
		return required + ((optional.length > 2) ? optional.slice(0, -2) + "]" : "");
	}
	return "";
};

/**
 * Generate a random integer in the range [min, max)
 * @param {Number} max - The upper limit (exclusive)
 * @param {Number} min - The lower limit, defaults to 0 if not specified (inclusive)
 * @returns {Number} A number between min and max
 */
module.exports.randint = function(max, min) {
	if (arguments.length < 2) { min = 0; }
	return min + Math.floor((max - min) * Math.random());
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
		const x = (hexString.length > 4) ? 2 : 1;
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

/**
 * Generate a guilds banner image using the banner object from a guild object
 * @param {Object} data - The banner object of a guild object from the wynncraft api
 * @returns A buffer object of the banner image or null if failed
 */
module.exports.createBannerImage = async function(data) {
	if (!data) return null;
	const width = 40;
	const height = width * 2;
	const canvas = createCanvas(width, height);
	const ctx = canvas.getContext("2d");

	ctx.fillStyle = exports.colors[data.base.toLowerCase()].rgb();
	ctx.fillRect(0, 0, width, height);

	try {
		for (const layer of data.layers) {
			const tempCanv = createCanvas(width, height);
			const tempCtx = tempCanv.getContext("2d");
			tempCtx.imageSmoothingEnabled = false;
			const img = await loadImage(`./dist/images/banners/patterns/${layer.pattern.toLowerCase()}.png`);
			tempCtx.drawImage(img, 0, 0, width, height);

			const imgData = tempCtx.getImageData(0, 0, width, height);
			for (let i = 0; i < imgData.data.length; i += 4) {
				imgData.data.set([...exports.colors[layer.colour.toLowerCase()].rgbArray()], i);
			}
			tempCtx.putImageData(imgData, 0, 0);
			ctx.drawImage(tempCanv, 0, 0, width, height);
		}
		return canvas.toBuffer("image/png");
	} catch (e) {
		console.log(e);
		return null;
	}
};

/**
 * Fetch the skin of the player with the given uuid and extract the face
 * @param {String} uuid - The uuid of the player who's face you'd like to fetch
 * @returns A buffer object of the face image or null if failed
 */
module.exports.fetchPlayerFace = async function(uuid) {
	try {
		let obj = (await (await fetch(`https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`))
			.json()).properties[0].value;
		obj = JSON.parse(Buffer.from(obj, "base64").toString("utf-8"));

		let img = await (await fetch(obj.textures.SKIN.url)).buffer();
		img = await loadImage(img);

		const size = 40;
		const canvas = createCanvas(size, size);
		const ctx = canvas.getContext("2d");
		ctx.imageSmoothingEnabled = false;

		ctx.drawImage(img, 8, 8, 8, 8, 0, 0, size, size);
		ctx.drawImage(img, 40, 8, 8, 8, 0, 0, size, size);

		return canvas.toBuffer("image/png");
	} catch (e) {
		console.log(e);
		return null;
	}
};

/**
 * Fetch a bust image of the player with the given uuid and add their rank on a plaque below if they have one
 * @param {String} uuid - The uuid of the player who's skin will be used
 * @param {String} rank - The rank to place below the player's image
 * @returns A buffer object of the bust image or null if failed
 */
module.exports.createRankImage = async function(uuid, rank) {
	const size = 240;
	try {
		let img = loadImage(await (await fetch(`https://visage.surgeplay.com/bust/${size}/${uuid}.png`)).buffer());

		const canvas = createCanvas(size, size + 78);
		const ctx = canvas.getContext("2d");
		ctx.imageSmoothingEnabled = false;

		ctx.drawImage(await img, 0, 0);
		if (["CHAMPION", "HERO", "VIP+", "VIP"].includes(rank)) {
			ctx.drawImage(await loadImage(`./dist/images/ranks/${rank}.png`), 0, size + 10);
		}

		// writeFileSync("./test.png", canvas.toBuffer());
		return canvas.toBuffer("image/png");
	} catch (e) {
		console.log(e);
		return null;
	}
};

/**
 * Make a request to the wynncraft api for a given guild's data
 * @param {String} name - The name of the guild (case sensitive)
 * @returns - The guild object or an object containing an error
 */
module.exports.fetchGuild = async function(name) {
	let guildData = await fetch(
		`https://api.wynncraft.com/public_api.php?action=guildStats&command=${name}`
	);
	return await guildData.json();
};

/**
 * Make a request to the wynncraft api for a given player's data
 * @param {String} name - The player's name (case insensitive)
 * @returns - The player object or an object containing an error
 */
module.exports.fetchPlayer = async function(name) {
	const playerData = await fetch(
		`https://api.wynncraft.com/v2/player/${name}/stats`
	);
	return await playerData.json();
};

/**
 * Convert a string to title case
 * @param {String} string - The string to convert
 * @returns The input string in title case
 */
module.exports.toTitleCase = function(string) {
	return string.toLowerCase().split(" ").map((word) => {
		return word.slice(0, 1).toUpperCase() + word.slice(1);
	});
};

module.exports.makeDateFriendly = function(dateString) {
	const dateTime = dateString.split("T");
	const today = new Date();
	const date = dateTime[0].split("-").map((e) => {
		return parseInt(e);
	});

	if (date[0] === today.getUTCFullYear() && date[1] === today.getUTCMonth() + 1 && today.getUTCDate() === date[2]) {
		dateTime[0] = "today at";
	} else {
		dateTime[0] = [date[2], date[1], date[0]].join("/");
	}

	dateTime[1] = dateTime[1].slice(0, 5);

	return dateTime.join(" ");
};

/**
 * Take a number and add spaces to make it more readable
 * @param {number} num - The number to format
 * @returns The number as a formatted string
 */
module.exports.spaceNumber = function(num) {
	num = `${num}`;
	let result = "";
	for (let i = 1; i <= num.length; ++i) {
		result = `${num.charAt(num.length - i)}${((i - 1) % 3 === 0) ? " " : ""}${result}`;
	}
	return result.trim();
};

/**
 * Take a number of minutes and format it as Xh Xm
 * @param {number} num - The number to format
 */
module.exports.asHours = function(num) {
	const hours = Math.floor(num / 60);
	const minutes = num - (hours * 60);
	return `${hours >= 1 ? `${exports.spaceNumber(hours)}h ` : ""}${minutes}m`;
};

/**
 * Take a number of minutes and format it as Xd Xh Xm
 * @param {number} num - The number to format
 */
module.exports.asDays = function(num) {
	const days = Math.floor(num / 1440);
	const hours = Math.floor((num - (days * 1440)) / 60);
	const minutes = num - (days * 1440 + hours * 60);
	return `${days >= 1 ? `${exports.spaceNumber(days)}d ` : ""}${hours >= 1 ? `${hours}h ` : ""}${minutes}m`;
};

/**
 * Take a number of meters and return a string in the format Xkm Xm
 * @param {number} num - The number to format
 * @returns A formatted string
 */
module.exports.asDistance = function(num) {
	return `${num / 1000 >= 1 ? `${exports.spaceNumber(Math.floor(num / 1000))}km ` : ""}${num % 1000}m`;
};

module.exports.getUuid = async function(name) {
	const obj = await (await fetch(`https://api.mojang.com/users/profiles/minecraft/${name}`)).json();
	return obj.id;
};

/**
 * Format two strings with the maximum amount of space between them within the given number of characters
 * @param {String} str1 - The string on the left
 * @param {String} str2 - The string on the right
 * @param {Number} totalSpace - The number of characters to fit the text into
 * @returns The formatted string
 */
module.exports.spaceBetween = function(str1, str2, totalSpace) {
	totalSpace -= (String(str1).length + String(str2).length);
	return `${str1}${(totalSpace >= 0) ? " ".repeat(totalSpace) : ""}${str2}`;
};

/**
 * Fetch the forum ID and username of a given player, if they exist
 * @param {String} name - The name of the player who's forum ID you'd like to fetch
 * @returns An object containing the forum ID and username of the player if they exist, else null
 */
module.exports.fetchForumData = async function(name) {
	const forumData = await (await fetch(`https://api.wynncraft.com/forums/getForumId/${name}`)).json();
	if (forumData.id) {
		return { id: forumData.id, username: forumData.username };
	} else return null;
};

module.exports.createButton = function() {

};