const { loadImage, createCanvas } = require("canvas");
const { writeFileSync } = require("fs");
const fetch = require("node-fetch");
const { getUuid } = require("./src/utility/_utility");
const Discord = require("discord.js");

async function rankImage(uuid, rank) {
	const size = 240;
	try {
		let img = await (await fetch(`https://visage.surgeplay.com/bust/${size}/${uuid.replaceAll("-", "")}.png`)).buffer();
		img = loadImage(img);

		const canvas = createCanvas(size, size + 90);
		const ctx = canvas.getContext("2d");
		ctx.imageSmoothingEnabled = false;

		ctx.drawImage(await img, 0, 0);
		if (["CHAMPION", "HERO", "VIP+", "VIP"].includes(rank)) {
			ctx.drawImage(await loadImage(`./src/images/ranks/${rank}.png`), 0, size+10);
		}

		writeFileSync("./test.png", canvas.toBuffer());
		return null;
	} catch (e) {
		console.log(e);
		return null;
	}
}

(async () => {
	await rankImage(await getUuid("Invinci"), "CHAMPION");
	Discord.Util.escapeItalic("_Wahoo_");
})();