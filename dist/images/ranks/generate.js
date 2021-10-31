const path = require("path");
const { writeFileSync } = require("fs");
const { loadImage, createCanvas } = require("canvas");
const { Color } = require(path.join(__dirname, "../../utility/utility"));

const wynndataColor = {
	"VIP": "#009B00",
	"VIP+": "#50AED8",
	"HERO": "#9B009B",
	"CHAMPION": "#E9CF4E"
};
const bracketColor = {
	"VIP": "#009700",
	"VIP+": "#4DE7E7",
	"HERO": "#9B009B",
	"CHAMPION": "#FDFD54"
};
const textColor = {
	"VIP": "#4DE74D",
	"VIP+": "#009F9F",
	"HERO": "#E34CE3",
	"CHAMPION": "#F3A200"
};

async function recolor(color, rank) {
	const width = 240;
	// const height = 80;
	const height = 68;
	const bgImg = await loadImage("./background.png");
	const txtImg = loadImage(`./.${rank}.png`);
	const canvas = createCanvas(width, height);
	const ctx = canvas.getContext("2d");
	ctx.imageSmoothingEnabled = false;

	ctx.drawImage(bgImg, 0, 0);
	const imgData = ctx.getImageData(0, 0, width, height);
	for (let j = 0; j < imgData.data.length; j += 4) {
		imgData.data.set([...(new Color(color)).rgbArray()], j);
	}
	ctx.putImageData(imgData, 0, 0);
	// ctx.drawImage(await txtImg, 0, 0);
	ctx.drawImage(await txtImg, 0, 6, 240, 68, 0, 2, width, height);

	writeFileSync(`./${rank}.png`, canvas.toBuffer());
}

(async () => {
	//info Change this variable to change the color scheme
	const color = wynndataColor;
	for (const i in color) {
		await recolor(color[i], i);
	}
})();