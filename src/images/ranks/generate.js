const { writeFileSync } = require("fs");
const { loadImage, createCanvas } = require("canvas");
const { Color } = require("../../utility/_utility");

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
	const bgImg = await loadImage("./background.png");
	const txtImg = loadImage(`./.${rank}.png`);
	const canvas = createCanvas(240, 80);
	const ctx = canvas.getContext("2d");
	ctx.imageSmoothingEnabled = false;

	ctx.drawImage(bgImg, 0, 0);
	let imgData = ctx.getImageData(0, 0, 240, 80);
	for (let j = 0; j < imgData.data.length; j += 4) {
		imgData.data.set([...(new Color(color)).rgbArray()], j);
	}
	ctx.putImageData(imgData, 0, 0);
	ctx.drawImage(await txtImg, 0, 0);

	writeFileSync(`./${rank}.png`, canvas.toBuffer());
}

(async () => {
	//i Change this variable to change the color scheme
	const color = wynndataColor;
	for (let i in color) {
		await recolor(color[i], i);
	}
})();