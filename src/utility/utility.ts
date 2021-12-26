import canv from "canvas";
const { createCanvas, loadImage } = canv;
import { HexColorString, TextChannel } from "discord.js";
import fetch from "node-fetch";
import { createInterface } from "readline";
import { BannerData, Command, customClient, MojangAPIProfileResponse, MojangApiProfileValueObject, Permission, Rank, WynnAPIPlayer } from "../types";

/**
 * Parse a command's arguments into a string
 * @param command - The command object to parse the arguments for
 * @returns Argument string
 */
export function parseArguments(command: Command) {
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

/**
 * Generate a random integer in the range [min, max)
 * @param max - The upper limit (exclusive)
 * @param min - The lower limit (inclusive). `default: 0`
 * @returns A number between min and max
 */
export function randint(max: number, min = 0) {
	return min + Math.floor((max - min) * Math.random());
}

/**
 * Make an array of permissions into a human friendly string
 * @param permsArray - Array of permissions
 * @returns Comma seperated list of permissions
 */
export function parsePermissions(permsArray: Permission[]) {
	return permsArray.toString().replace(",", ", ");
}

/**
 * A class representing a color constructed from a hexadecimal string
 */
export class Color {
	r: number;
	g: number;
	b: number;
	a: number;
	/**
	 * @param hexString A hexadecimal string representing a color
	 */
	constructor(hexString: HexColorString) {
		/** multiplier */
		const x = (hexString.length > 4) ? 2 : 1;
		const hex = hexString.slice(1);
		this.r = parseInt(hex.slice(0, x * 1), 16);
		this.g = parseInt(hex.slice(x * 1, x * 2), 16);
		this.b = parseInt(hex.slice(x * 2, x * 3), 16);
		this.a = (hex.length / x === 4) ? parseInt(hex.slice(x * 3), 16) / 255 : 1;
	}

	rgb() { return `rgb(${this.r}, ${this.g}, ${this.b})`; }

	rgbArray() { return [this.r, this.g, this.b]; }

	rgba() { return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`; }

	rgbaArray() { return [this.r, this.g, this.b, this.a]; }

	withAlpha(alpha: number) { return `rgba(${this.r}, ${this.g}, ${this.b}, ${alpha})`; }
}

/**  An array of all the minecraft banner colors as `Color` objects */
export const colors: { [key: string]: Color; } = {
	white: new Color("#F9FFFE"),
	light_gray: new Color("#9D9D97"),
	gray: new Color("#474F52"),
	black: new Color("#1D1D21"),
	yellow: new Color("#FED83D"),
	orange: new Color("#F9801D"),
	red: new Color("#B02E26"),
	brown: new Color("#835432"),
	lime: new Color("#80C71F"),
	green: new Color("#5E7C16"),
	light_blue: new Color("#3AB3DA"),
	cyan: new Color("#169C9C"),
	blue: new Color("#3C44AA"),
	pink: new Color("#F38BAA"),
	magenta: new Color("#C74EBD"),
	purple: new Color("#8932B8")
};

/**
 * Generate a guilds banner image using the banner object from a guild object
 * @param data - The banner object of a guild object from the wynncraft api
 * @returns A buffer object of the banner image or null if failed
 */
export async function createBannerImage(data: BannerData | null) {
	if (!data) return null;
	const width = 40;
	const height = width * 2;
	const canvas = createCanvas(width, height);
	const ctx = canvas.getContext("2d");

	ctx.fillStyle = colors[data.base.toLowerCase()].rgb();
	ctx.fillRect(0, 0, width, height);

	try {
		for (const layer of data.layers) {
			const tempCanv = createCanvas(width, height);
			const tempCtx = tempCanv.getContext("2d");
			tempCtx.imageSmoothingEnabled = false;
			const img = await loadImage(`./images/banners/patterns/${layer.pattern.toLowerCase()}.png`);
			tempCtx.drawImage(img, 0, 0, width, height);

			const imgData = tempCtx.getImageData(0, 0, width, height);
			for (let i = 0; i < imgData.data.length; i += 4) {
				imgData.data.set([...colors[layer.colour.toLowerCase()].rgbArray()], i);
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
 * @param uuid - The uuid of the player who's face you'd like to fetch
 * @returns A buffer object of the face image or null if failed
 */
export async function fetchPlayerFace(uuid: string) {
	try {
		const response = await fetch(`https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`);
		if (!response.ok) return null;

		const obj = (await response.json() as MojangAPIProfileResponse).properties[0].value;

		const valueObj = JSON.parse(Buffer.from(obj, "base64").toString("utf-8")) as MojangApiProfileValueObject;

		const imgBuffer = await (await fetch(valueObj.textures.SKIN.url)).arrayBuffer();
		const img = await loadImage(Buffer.from(imgBuffer));

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
 * @param uuid - The uuid of the player who's skin will be used
 * @param rank - The rank to place below the player's image
 * @returns A buffer object of the bust image or null if failed
 */
export async function createRankImage(uuid: string, rank: Rank) {
	const size = 240;
	try {
		let img = loadImage(
			Buffer.from(
				await (
					await fetch(`https://visage.surgeplay.com/bust/${size}/${uuid}.png`)
				).arrayBuffer()
			)
		);

		const canvas = createCanvas(size, size + 78);
		const ctx = canvas.getContext("2d");
		ctx.imageSmoothingEnabled = false;

		ctx.drawImage(await img, 0, 0);
		if (rank) {
			ctx.drawImage(await loadImage(`./images/ranks/${rank}.png`), 0, size + 10);
		}
		return canvas.toBuffer("image/png");
	} catch (e) {
		console.log(e);
		return null;
	}
};

/**
 * Make a request to the wynncraft api for a given guild's data
 * @param name - The name of the guild (case sensitive)
 * @returns - The guild object or an object containing an error
 */
export async function fetchGuild(name: string) {
	let guildData = await fetch(
		`https://api.wynncraft.com/public_api.php?action=guildStats&command=${name}`
	);
	return await guildData.json();
};

/**
 * Make a request to the wynncraft api for a given player's data
 * @param name - The player's name (case insensitive)
 * @returns - The player object or an object containing an error
 */
export async function fetchPlayer(name: string) {
	const playerData = await fetch(
		`https://api.wynncraft.com/v2/player/${name}/stats`
	);
	return await playerData.json() as WynnAPIPlayer;
};

/**
 * Convert a string to title case
 * @param string - The string to convert
 * @returns The input string in title case
 */
export function toTitleCase(string = "") {
	return string.toLowerCase().split(" ").map((word) => {
		return word.slice(0, 1).toUpperCase() + word.slice(1);
	});
};

/**
 * Convert a string in the form YYYY-MM-DDTHH:MM:SS.SSSZ to DD/MM/YYYY HH:MM or, if the date is today, today at HH:MM
 * @param dateString a date string in the form YYYY-MM-DDTHH:MM:SS.SSSZ
 * @returns a formatted date string
 */
export function makeDateFriendly(dateString: string) {
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
 * Take a number and add spaces to make it more readable (every exponent of 1000, so 10000000 would be 10 000 000)
 * @param num - The number to format
 * @returns The number as a formatted string
 */
export function spaceNumber(num: number) {
	const numString = num.toString();
	let result = "";
	for (let i = 1; i <= numString.length; ++i) {
		result = `${numString.charAt(numString.length - i)}${((i - 1) % 3 === 0) ? " " : ""}${result}`;
	}
	return result.trim();
};

/**
 * Take a number of minutes and format it as Xh Xm
 * @param num - The number to format
 */
export function asHours(num: number) {
	const hours = Math.floor(num / 60);
	const minutes = num - (hours * 60);
	return `${hours >= 1 ? `${spaceNumber(hours)}h ` : ""}${minutes}m`;
};

/**
 * Take a number of minutes and format it as Xd Xh Xm
 * @param num - The number to format
 */
export function asDays(num: number) {
	const days = Math.floor(num / 1440);
	const hours = Math.floor((num - (days * 1440)) / 60);
	const minutes = num - (days * 1440 + hours * 60);
	return `${days >= 1 ? `${spaceNumber(days)}d ` : ""}${hours >= 1 ? `${hours}h ` : ""}${minutes}m`;
};

/**
 * Take a number of meters and return a string in the format Xkm Xm
 * @param num - The number to format
 * @returns A formatted string
 */
export function asDistance(num: number) {
	return `${num / 1000 >= 1 ? `${spaceNumber(Math.floor(num / 1000))}km ` : ""}${num % 1000}m`;
};

/**
 * Fetch the uuid for a given player name from the minecraft API
 * @param name - The name of the player you want the uuid for
 * @returns The uuid of the relevant player or null
 */
export async function getUuid(name: string) {
	try {
		const response = await fetch(`https://api.mojang.com/users/profiles/minecraft/${name}`);
		const obj = await response.json() as { name: string, id: string; };
		return obj.id;
	} catch (e) {
		console.log(e);
		return null;
	}
};

/**
 * Format two strings with the maximum amount of space between them within the given number of characters
 * @param str1 - The string on the left
 * @param str2 - The string on the right
 * @param totalSpace - The number of characters to fit the text into
 * @returns The formatted string
 */
export function spaceBetween(str1: string, str2: string, totalSpace: number) {
	totalSpace -= (String(str1).length + String(str2).length);
	return `${str1}${(totalSpace >= 0) ? " ".repeat(totalSpace) : ""}${str2}`;
};

/**
 * Fetch the forum ID and username of a given player, if they exist
 * @param name - The name of the player who's forum ID you'd like to fetch
 * @returns An object containing the forum ID and username of the player if they exist, else null
 */
export async function fetchForumData(name: string) {
	const forumData = await (await fetch(`https://api.wynncraft.com/forums/getForumId/${name}`)).json() as
		{ username: string, ign: string, id: number; };
	if (forumData.id) {
		return { id: forumData.id, username: forumData.username };
	} else return null;
};

/**
 * Allow someone with console access to the bot to input a channel id and a message to send to that channel as
 * the bot.
 * @param client The bot client
 */
export async function msgFromConsole(client: customClient) {
	let channelCache = "";
	const readline = createInterface({
		input: process.stdin,
		output: process.stdout
	});
	readline.question("Channel: ", input => {
		if (input === "" && channelCache !== "") {
			input = channelCache;
		}
		let channel = client.channels.cache.get(input);
		if (channel) {
			channelCache = input;
			readline.question("Message: ", async input => {
				await (channel as TextChannel).send(input);
				msgFromConsole(client);
			});
		} else {
			msgFromConsole(client);
		}
	});
}