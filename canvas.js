const fetch = require("node-fetch");
const { createBannerImage } = require("./src/utility/_utility");

(async () => {
	let guild = await fetchGuild("HackForums");
	createBannerImage(guild.banner, "./banner.png");
})();

async function fetchGuild(name) {
	let guildData = await fetch(
		`https://api.wynncraft.com/public_api.php?action=guildStats&command=${name}`
	);
	return await guildData.json();
}

// class Banner {
// 	constructor() {
// 		this.canvas = createCanvas(Banner.width, Banner.height);
// 		this.ctxt = this.canvas.getContext("2d");

// 		if (arguments.length === 1) {
// 			// parse banner object from guild object
// 		}
// 	}

// 	setBase(color) {
// 		this.ctxt.fillStyle = color.rgb();
// 		this.ctxt.fillRect(0, 0, Banner.width, Banner.height);
// 	}

// 	square_bottom_left(color) {
// 		this.ctxt.fillStyle = color.rgb();
// 		this.ctxt.fillRect(0, 27, 9, 13);
// 		this.ctxt.fillStyle = color.withAlpha(Banner.alpha);
// 		this.ctxt.fillRect(0, 26, 10, 14);
// 	}

// 	border(color) {
// 		this.ctxt.fillStyle = color.rgb();
// 		this.ctxt.fillRect(0, 0, 20, 2);
// 		this.ctxt.fillRect(0, 38, 20, 2);
// 		this.ctxt.fillRect(0, 2, 2, 36);
// 		this.ctxt.fillRect(18, 2, 2, 36);
// 		this.ctxt.fillStyle = color.withAlpha(Banner.alpha);
// 		this.ctxt.fillRect(2, 2, 16, 1);
// 		this.ctxt.fillRect(2, 37, 16, 1);
// 		this.ctxt.fillRect(2, 3, 1, 34);
// 		this.ctxt.fillRect(17, 3, 1, 34);
// 	}

// 	square_bottom_right(color) {
// 		this.ctxt.fillStyle = color.rgb();
// 		this.ctxt.fillRect(11, 27, 9, 13);
// 		this.ctxt.fillStyle = color.withAlpha(Banner.alpha);
// 		this.ctxt.fillRect(10, 26, 10, 14);
// 	}

// 	bricks(color) {
// 		for (let y = 0; y < 10; ++y) {
// 			for (let x = 0; x < 4; ++x) {
// 				let m = (y % 2) * 3;
// 				this.ctxt.fillStyle = color.rgb();
// 				this.ctxt.fillRect(x*6 - m, y*4, 4, 2);
// 				this.ctxt.fillStyle = color.withAlpha(Banner.alpha);
// 				this.ctxt.fillRect(x*6 - m, y*4 + 1, 5, 2);
// 				this.ctxt.fillStyle = color.withAlpha(Banner.alpha2);
// 				this.ctxt.fillRect(x*6 - m, y*4, 5, 1);
// 			}
// 		}
// 	}

// 	stripe_bottom(color) {
// 		this.ctxt.fillStyle = color.rgb();
// 		this.ctxt.fillRect(0, 27, 20, 13);
// 		this.ctxt.fillStyle = color.withAlpha(Banner.alpha);
// 		this.ctxt.fillRect(0, 26, 20, 14);
// 	}

// 	triangle_bottom(color) {
// 		for (let i = -1; i < 9; ++i) {
// 			this.ctxt.fillStyle = color.rgb();
// 			this.ctxt.fillRect(i+1, 37 - i*2, 18-i*2, 2);
// 			this.ctxt.fillStyle = color.withAlpha(Banner.alpha);
// 			this.ctxt.fillRect(i, 37 - i*2, 20-i*2, 2);
// 		}
// 		this.ctxt.fillRect(9, 20, 2, 1);
// 	}

// 	triangles_bottom(color) {
// 		for (let i = 0; i < 3; ++i) {
// 			this.ctxt.fillStyle = color.withAlpha(Banner.alpha);
// 			this.ctxt.fillRect(i*7, 36, 6, 2);
// 			this.ctxt.fillRect(i*7 + 1, 34, 4, 2);
// 			this.ctxt.fillRect(i*7 + 2, 33, 2, 1);
// 			for (let j = 0; j < 3; ++j) {
// 				this.ctxt.fillStyle = color.rgb();
// 				this.ctxt.fillRect(j + i*7, 38-j*2, 6-2*j, 2);
// 			}
// 		}
// 		this.ctxt.fillRect(0, 39, 20, 1);
// 		this.ctxt.fillStyle = color.withAlpha(Banner.alpha);
// 		this.ctxt.fillRect(0, 38, 20, 1);
// 	}

// 	curly_border(color) {} //TODO
// 	cross(color) {
// 		for (let i = 0; i < 20; ++i) {
// 			this.ctxt.fillStyle = color.rgb();
// 			this.ctxt.fillRect(i, i*2, 2, 4);
// 			this.ctxt.fillRect(i, 36 - i*2, 2, 4);
// 			this.ctxt.fillStyle = color.withAlpha(Banner.alpha);
// 			this.ctxt.fillRect(i, i*2, 3, 6);
// 			this.ctxt.fillRect(i, 34 - i*2, 3, 6);
// 		}
// 	}

// 	creeper(color) {
// 		this.ctxt.fillStyle = color.rgb();
// 		this.ctxt.fillRect(2, 15, 4, 4);
// 		this.ctxt.fillRect(14, 15, 4, 4);
// 		this.ctxt.fillRect(8, 21, 4, 7);
// 		this.ctxt.fillRect(5, 24, 10, 4);
// 		this.ctxt.fillRect(5, 28, 1, 3);
// 		this.ctxt.fillRect(14, 28, 1, 3);
// 		this.ctxt.fillStyle = color.withAlpha(Banner.alpha);
// 		this.ctxt.fillRect(1, 14, 6, 6);
// 		this.ctxt.fillRect(13, 14, 6, 6);
// 		this.ctxt.fillRect(7, 20, 6, 9);
// 		this.ctxt.fillRect(4, 23, 3, 9);
// 		this.ctxt.fillRect(13, 23, 3, 9);
// 	}

// 	stripe_center(color) {
// 		this.ctxt.fillStyle = color.rgb();
// 		this.ctxt.fillRect(8, 0, 4, 40);
// 		this.ctxt.fillStyle = color.withAlpha(Banner.alpha);
// 		this.ctxt.fillRect(7, 0, 6, 40);
// 	}

// 	stripe_downleft(color) {
// 		for (let i = 0; i < 20; ++i) {
// 			this.ctxt.fillStyle = color.rgb();
// 			this.ctxt.fillRect(i, 34 - i*2, 3, 6);
// 			this.ctxt.fillStyle = color.withAlpha(Banner.alpha);
// 			this.ctxt.fillRect(i, 32 - i*2, 4, 8);
// 		}
// 	}

// 	stripe_downright(color) {
// 		for (let i = 0; i < 20; ++i) {
// 			this.ctxt.fillStyle = color.rgb();
// 			this.ctxt.fillRect(i, i*2, 3, 6);
// 			this.ctxt.fillStyle = color.withAlpha(Banner.alpha);
// 			this.ctxt.fillRect(i, i*2, 4, 8);
// 		}
// 	}

// 	flower(color) {} //TODO

// 	gradient(color) {
// 		const gradient = this.ctxt.createLinearGradient(0, 0, 0, 40);
// 		gradient.addColorStop(0, color.rgb());
// 		gradient.addColorStop(1, "#0000");
// 		this.ctxt.fillStyle = gradient;
// 		this.ctxt.fillRect(0, 0, 40, 40);
// 	}

// 	half_horizonal(color) {
// 		this.ctxt.fillStyle = color.rgb();
// 		this.ctxt.fillRect(0, 0, 20, 20);
// 		this.ctxt.fillStyle = color.withAlpha(Banner.alpha);
// 		this.ctxt.fillRect(0, 0, 20, 21);
// 	}

// 	diagonal_left(color) {
// 		for (let i = 0; i < 20; ++i) {
// 			this.ctxt.fillStyle = color.rgb();
// 			this.ctxt.fillRect(i, 0, 1, 40 - (i+1)*2);
// 			this.ctxt.fillStyle = color.withAlpha(Banner.alpha);
// 			this.ctxt.fillRect(i, 0, 1, 40 - i*2);
// 		}
// 	}

// 	stripe_left(color) {
// 		this.ctxt.fillStyle = color.rgb();
// 		this.ctxt.fillRect(0, 0, 6, 40);
// 		this.ctxt.fillStyle = color.withAlpha(Banner.alpha);
// 		this.ctxt.fillRect(0, 0, 7, 40);
// 	}

// 	circle_middle(color) {} //TODO

// 	async mojang(color) {
// 		let c = createCanvas(20, 40);
// 		let ctx = c.getContext("2d");
// 		let img = await loadImage("./src/images/banner_patterns/mojang.png");
// 		ctx.drawImage(img, 0, 0, 20, 40);

// 		let idata = ctx.getImageData(0, 0, 20, 40);
// 		for (let i = 0; i < idata.data.length; i+=4) {
// 			idata.data.set([...color.rgbArray()], i);
// 		}
// 		ctx.putImageData(idata, 0, 0);
// 		img = await loadImage(c.toBuffer("image/png"));
// 		this.ctxt.drawImage(img, 0, 0, 20, 40);
// 	}

// 	rhombus_middle(color) {
// 		for (let i = 0; i <= 10; ++i) {
// 			this.ctxt.fillStyle = color.rgb();
// 			this.ctxt.fillRect(4 + Math.abs(i-5), 9+i*2, 12-Math.abs(i-5)*2, 2);
// 			this.ctxt.fillStyle = color.withAlpha(Banner.alpha);
// 			this.ctxt.fillRect(3 + Math.abs(i-5), 9+i*2, 14-Math.abs(i-5)*2, 2);
// 		}
// 		this.ctxt.fillRect(9, 8, 2, 1);
// 		this.ctxt.fillRect(9, 31, 2, 1);
// 	}

// 	stripe_middle(color) {
// 		this.ctxt.fillStyle = color.rgb();
// 		this.ctxt.fillRect(0, 19, 20, 4);
// 		this.ctxt.fillStyle = color.withAlpha(Banner.alpha);
// 		this.ctxt.fillRect(0, 18, 20, 6);
// 	}

// 	diagonal_right_mirror(color) {
// 		for (let i = 0; i < 20; ++i) {
// 			this.ctxt.fillStyle = color.rgb();
// 			this.ctxt.fillRect(i, 0, 1, i*2);
// 			this.ctxt.fillStyle = color.withAlpha(Banner.alpha);
// 			this.ctxt.fillRect(i, 0, 1, (i+1)*2);
// 		}
// 	}

// 	stripe_right(color) {
// 		this.ctxt.fillStyle = color.rgb();
// 		this.ctxt.fillRect(14, 0, 6, 40);
// 		this.ctxt.fillStyle = color.withAlpha(Banner.alpha);
// 		this.ctxt.fillRect(13, 0, 7, 40);
// 	}

// 	straight_cross(color) {
// 		this.ctxt.fillStyle = color.rgb();
// 		this.ctxt.fillRect(9, 0, 2, 40);
// 		this.ctxt.fillRect(0, 19, 20, 2);
// 		this.ctxt.fillStyle = color.withAlpha(Banner.alpha);
// 		this.ctxt.fillRect(8, 0, 4, 40);
// 		this.ctxt.fillRect(0, 18, 8, 4);
// 		this.ctxt.fillRect(12, 18, 8, 4);
// 	}

// 	skull(color) {} //TODO

// 	stripe_small(color) {
// 		for (let i = 0; i < 4; ++i) {
// 			this.ctxt.fillStyle = color.rgb();
// 			this.ctxt.fillRect(5*i + 2, 0, 1, 40);
// 			this.ctxt.fillStyle = color.withAlpha(Banner.alpha);
// 			this.ctxt.fillRect(5*i + 1, 0, 3, 40);
// 		}
// 	}

// 	square_top_left(color) {
// 		this.ctxt.fillStyle = color.rgb();
// 		this.ctxt.fillRect(0, 0, 9, 13);
// 		this.ctxt.fillStyle = color.withAlpha(Banner.alpha);
// 		this.ctxt.fillRect(0, 0, 10, 14);
// 	}

// 	square_top_right(color) {
// 		this.ctxt.fillStyle = color.rgb();
// 		this.ctxt.fillRect(11, 0, 9, 13);
// 		this.ctxt.fillStyle = color.withAlpha(Banner.alpha);
// 		this.ctxt.fillRect(10, 0, 10, 14);
// 	}

// 	stripe_top(color) {
// 		this.ctxt.fillStyle = color.rgb();
// 		this.ctxt.fillRect(0, 0, 20, 13);
// 		this.ctxt.fillStyle = color.withAlpha(Banner.alpha);
// 		this.ctxt.fillRect(0, 0, 20, 14);
// 	}

// 	triangle_top(color) {
// 		for (let i = -1; i < 9; ++i) {
// 			this.ctxt.fillStyle = color.rgb();
// 			this.ctxt.fillRect(i+1, i*2 + 1, 18-i*2, 2);
// 			this.ctxt.fillStyle = color.withAlpha(Banner.alpha);
// 			this.ctxt.fillRect(i, i*2 + 1, 20-i*2, 2);
// 		}
// 		this.ctxt.fillRect(9, 19, 2, 1);
// 	}

// 	triangles_top(color) {
// 		for (let i = 0; i < 3; ++i) {
// 			this.ctxt.fillStyle = color.withAlpha(Banner.alpha);
// 			this.ctxt.fillRect(i*7, 2, 6, 2);
// 			this.ctxt.fillRect(i*7 + 1, 4, 4, 2);
// 			this.ctxt.fillRect(i*7 + 2, 6, 2, 1);
// 			for (let j = 0; j < 3; ++j) {
// 				this.ctxt.fillStyle = color.rgb();
// 				this.ctxt.fillRect(j + i*7, j*2, 6-2*j, 2);
// 			}
// 		}
// 		this.ctxt.fillRect(0, 0, 20, 1);
// 		this.ctxt.fillStyle = color.withAlpha(Banner.alpha);
// 		this.ctxt.fillRect(0, 1, 20, 1);
// 	}

// 	half_vertical(color) {
// 		this.ctxt.fillStyle = color.rgb();
// 		this.ctxt.fillRect(0, 0, 10, 40);
// 		this.ctxt.fillStyle = color.withAlpha(Banner.alpha);
// 		this.ctxt.fillRect(0, 0, 11, 40);
// 	}

// 	gradient_up(color) {
// 		const gradient = this.ctxt.createLinearGradient(0, 0, 0, 40);
// 		gradient.addColorStop(0, "#0000");
// 		gradient.addColorStop(1, color.rgb());
// 		this.ctxt.fillStyle = gradient;
// 		this.ctxt.fillRect(0, 0, 40, 40);
// 	}

// 	half_vertical_mirror(color) {
// 		this.ctxt.fillStyle = color.rgb();
// 		this.ctxt.fillRect(10, 0, 10, 40);
// 		this.ctxt.fillStyle = color.withAlpha(Banner.alpha);
// 		this.ctxt.fillRect(9, 0, 11, 40);
// 	}

// 	half_horizontal_mirror(color) {
// 		this.ctxt.fillStyle = color.rgb();
// 		this.ctxt.fillRect(0, 20, 20, 20);
// 		this.ctxt.fillStyle = color.withAlpha(Banner.alpha);
// 		this.ctxt.fillRect(0, 19, 20, 21);
// 	}

// 	diagonal_left_mirror(color) {
// 		for (let i = 0; i < 20; ++i) {
// 			this.ctxt.fillStyle = color.rgb();
// 			this.ctxt.fillRect(i, (i+1)*2, 1, 40 - (i+1)*2);
// 			this.ctxt.fillStyle = color.withAlpha(Banner.alpha);
// 			this.ctxt.fillRect(i, i*2, 1, 40 - (i*2));
// 		}
// 	}

// 	diagonal_right(color) {
// 		for (let i = 0; i < 20; ++i) {
// 			this.ctxt.fillStyle = color.rgb();
// 			this.ctxt.fillRect(i, 40 - i*2, 1, (i+1)*2);
// 			this.ctxt.fillStyle = color.withAlpha(Banner.alpha);
// 			this.ctxt.fillRect(i, 40 - (i+1)*2, 1, (i+1)*2);
// 		}
// 	} //TODO

// 	saveAs(path) {
// 		fs.writeFileSync(path, this.canvas.toBuffer("image/png"));
// 	}
// }

// because eslint complains about static variables in objects they have to be added this way
// Banner.width = 20;
// Banner.height = 40;
// Banner.alpha = 0.75;
// Banner.alpha2 = 0.90;