"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchForumData = exports.spaceBetween = exports.getUuid = exports.asDistance = exports.asDays = exports.asHours = exports.spaceNumber = exports.makeDateFriendly = exports.toTitleCase = exports.fetchPlayer = exports.fetchGuild = exports.createRankImage = exports.fetchPlayerFace = exports.createBannerImage = exports.colors = exports.Color = exports.parsePermissions = exports.randint = exports.parseArguments = void 0;
const canvas_1 = require("canvas");
const node_fetch_1 = __importDefault(require("node-fetch"));
function parseArguments(command) {
    let required = "";
    let optional = " [";
    for (const option of command.options) {
        if (option.required) {
            required += ` <${option.name}>`;
        }
        else {
            optional += `${option.name}, `;
        }
    }
    return required + ((optional.length > 2) ? optional.slice(0, -2) + "]" : "");
}
exports.parseArguments = parseArguments;
function randint(max, min = 0) {
    return min + Math.floor((max - min) * Math.random());
}
exports.randint = randint;
function parsePermissions(permsArray) {
    return permsArray.toString().replace(",", ", ");
}
exports.parsePermissions = parsePermissions;
class Color {
    r;
    g;
    b;
    a;
    constructor(hexString) {
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
    withAlpha(alpha) { return `rgba(${this.r}, ${this.g}, ${this.b}, ${alpha})`; }
}
exports.Color = Color;
exports.colors = {
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
async function createBannerImage(data) {
    if (!data)
        return null;
    const width = 40;
    const height = width * 2;
    const canvas = (0, canvas_1.createCanvas)(width, height);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = exports.colors[data.base.toLowerCase()].rgb();
    ctx.fillRect(0, 0, width, height);
    try {
        for (const layer of data.layers) {
            const tempCanv = (0, canvas_1.createCanvas)(width, height);
            const tempCtx = tempCanv.getContext("2d");
            tempCtx.imageSmoothingEnabled = false;
            const img = await (0, canvas_1.loadImage)(`./src/images/banners/patterns/${layer.pattern.toLowerCase()}.png`);
            tempCtx.drawImage(img, 0, 0, width, height);
            const imgData = tempCtx.getImageData(0, 0, width, height);
            for (let i = 0; i < imgData.data.length; i += 4) {
                imgData.data.set([...exports.colors[layer.colour.toLowerCase()].rgbArray()], i);
            }
            tempCtx.putImageData(imgData, 0, 0);
            ctx.drawImage(tempCanv, 0, 0, width, height);
        }
        return canvas.toBuffer("image/png");
    }
    catch (e) {
        console.log(e);
        return null;
    }
}
exports.createBannerImage = createBannerImage;
;
async function fetchPlayerFace(uuid) {
    try {
        const response = await (0, node_fetch_1.default)(`https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`);
        if (!response.ok)
            return null;
        const obj = (await response.json()).properties[0].value;
        const valueObj = JSON.parse(Buffer.from(obj, "base64").toString("utf-8"));
        const imgBuffer = await (await (0, node_fetch_1.default)(valueObj.textures.SKIN.url)).buffer();
        const img = await (0, canvas_1.loadImage)(imgBuffer);
        const size = 40;
        const canvas = (0, canvas_1.createCanvas)(size, size);
        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 8, 8, 8, 8, 0, 0, size, size);
        ctx.drawImage(img, 40, 8, 8, 8, 0, 0, size, size);
        return canvas.toBuffer("image/png");
    }
    catch (e) {
        console.log(e);
        return null;
    }
}
exports.fetchPlayerFace = fetchPlayerFace;
;
async function createRankImage(uuid, rank) {
    const size = 240;
    try {
        let img = (0, canvas_1.loadImage)(await (await (0, node_fetch_1.default)(`https://visage.surgeplay.com/bust/${size}/${uuid}.png`)).buffer());
        const canvas = (0, canvas_1.createCanvas)(size, size + 78);
        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(await img, 0, 0);
        if (rank) {
            ctx.drawImage(await (0, canvas_1.loadImage)(`./src/images/ranks/${rank}.png`), 0, size + 10);
        }
        return canvas.toBuffer("image/png");
    }
    catch (e) {
        console.log(e);
        return null;
    }
}
exports.createRankImage = createRankImage;
;
async function fetchGuild(name) {
    let guildData = await (0, node_fetch_1.default)(`https://api.wynncraft.com/public_api.php?action=guildStats&command=${name}`);
    return await guildData.json();
}
exports.fetchGuild = fetchGuild;
;
async function fetchPlayer(name) {
    const playerData = await (0, node_fetch_1.default)(`https://api.wynncraft.com/v2/player/${name}/stats`);
    return await playerData.json();
}
exports.fetchPlayer = fetchPlayer;
;
function toTitleCase(string = "") {
    return string.toLowerCase().split(" ").map((word) => {
        return word.slice(0, 1).toUpperCase() + word.slice(1);
    });
}
exports.toTitleCase = toTitleCase;
;
function makeDateFriendly(dateString) {
    const dateTime = dateString.split("T");
    const today = new Date();
    const date = dateTime[0].split("-").map((e) => {
        return parseInt(e);
    });
    if (date[0] === today.getUTCFullYear() && date[1] === today.getUTCMonth() + 1 && today.getUTCDate() === date[2]) {
        dateTime[0] = "today at";
    }
    else {
        dateTime[0] = [date[2], date[1], date[0]].join("/");
    }
    dateTime[1] = dateTime[1].slice(0, 5);
    return dateTime.join(" ");
}
exports.makeDateFriendly = makeDateFriendly;
;
function spaceNumber(num) {
    const numString = num.toString();
    let result = "";
    for (let i = 1; i <= numString.length; ++i) {
        result = `${numString.charAt(numString.length - i)}${((i - 1) % 3 === 0) ? " " : ""}${result}`;
    }
    return result.trim();
}
exports.spaceNumber = spaceNumber;
;
function asHours(num) {
    const hours = Math.floor(num / 60);
    const minutes = num - (hours * 60);
    return `${hours >= 1 ? `${exports.spaceNumber(hours)}h ` : ""}${minutes}m`;
}
exports.asHours = asHours;
;
function asDays(num) {
    const days = Math.floor(num / 1440);
    const hours = Math.floor((num - (days * 1440)) / 60);
    const minutes = num - (days * 1440 + hours * 60);
    return `${days >= 1 ? `${exports.spaceNumber(days)}d ` : ""}${hours >= 1 ? `${hours}h ` : ""}${minutes}m`;
}
exports.asDays = asDays;
;
function asDistance(num) {
    return `${num / 1000 >= 1 ? `${exports.spaceNumber(Math.floor(num / 1000))}km ` : ""}${num % 1000}m`;
}
exports.asDistance = asDistance;
;
async function getUuid(name) {
    try {
        const response = await (0, node_fetch_1.default)(`https://api.mojang.com/users/profiles/minecraft/${name}`);
        const obj = await response.json();
        return obj.id;
    }
    catch (e) {
        console.log(e);
        return null;
    }
}
exports.getUuid = getUuid;
;
function spaceBetween(str1, str2, totalSpace) {
    totalSpace -= (String(str1).length + String(str2).length);
    return `${str1}${(totalSpace >= 0) ? " ".repeat(totalSpace) : ""}${str2}`;
}
exports.spaceBetween = spaceBetween;
;
async function fetchForumData(name) {
    const forumData = await (await (0, node_fetch_1.default)(`https://api.wynncraft.com/forums/getForumId/${name}`)).json();
    if (forumData.id) {
        return { id: forumData.id, username: forumData.username };
    }
    else
        return null;
}
exports.fetchForumData = fetchForumData;
;
