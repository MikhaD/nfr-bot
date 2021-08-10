const path = require("path");
const { fetchPlayer, createErrorEmbed, toTitleCase, makeDateFriendly, spaceNumber, asHours, asDistance, createRankImage, spaceBetween, fetchPlayerFace, fetchForumData } = require(path.join(__dirname, "../../utility/utility"));
const config = require(path.join(__dirname, "../../config.json"));
const { MessageAttachment, MessageEmbed } = require("discord.js");

module.exports = {
	name: "stats",
	aliases: ["player", "p"],
	args: {
		required: ["name"],
		optional: ["formatted"]
	},
	description: "Show the statistics of a given player, in plain text by default.",
	example: "stats Invinci true",
	cooldown: 5,

	async execute(msg, args) {
		const { code, data } = await fetchPlayer(args[0]);
		try {
			const player = data[0];

			const message = {};
			const embed = new MessageEmbed();
			message.embeds = [embed];
			embed.setColor((player.rank === "Player") ? config.colors.tag[player.meta.tag.value] : config.colors.rank[player.rank]);

			let forumData = fetchForumData(player.username);

			if (args.length > 1 && args[1].toLowerCase() === "true") {
				embed.setTitle(`Player Stats for ${player.username}`);
				embed.setURL(`https://wynncraft.com/stats/player/${player.username}`);
				embed.setDescription((player.guild.name !== null) ? `${toTitleCase(player.guild.rank)} of **${player.guild.name}**` : "*Not part of a guild*");

				const attachmentName = "rankImage.png";
				let img = createRankImage(player.uuid, player.meta.tag.value);

				if (player.meta.location.online) {
					embed.addField("Status:", "🟢 Online", true);
					embed.addField("Current World:", player.meta.location.server, true);
				} else {
					embed.addField("Status:", "🔴 Offline", true);
					embed.addField("Last Seen:", makeDateFriendly(player.meta.lastJoin), true);
				}
				embed.addField("First Joined:", makeDateFriendly(player.meta.firstJoin), true);

				embed.addField("\u200b", "\u200b");

				embed.addField("Total Level:", spaceNumber(player.global.totalLevel.combined), true);
				embed.addField("Combat Total:", spaceNumber(player.global.totalLevel.combat), true);
				embed.addField("Profession Total:", spaceNumber(player.global.totalLevel.profession), true);

				embed.addField("\u200b", "\u200b");
				//i For why the playtime is multiplied by 4.7 check https://github.com/Wynncraft/WynncraftAPI/issues/56
				embed.addField("Playtime:", asHours(Math.floor(player.meta.playtime * 4.7)), true);
				embed.addField("Logins:", spaceNumber(player.global.logins), true);
				embed.addField("Deaths:", spaceNumber(player.global.deaths), true);

				embed.addField("\u200b", "\u200b");

				embed.addField("Chests Opened:", spaceNumber(player.global.chestsFound), true);
				embed.addField("Mobs Killed:", spaceNumber(player.global.mobsKilled), true);
				embed.addField("Distance Traveled:", asDistance(player.global.blocksWalked), true);

				img = await img;
				if (img !== null) {
					const attachment = new MessageAttachment(img, attachmentName);
					message.files = [attachment];
					embed.setThumbnail(`attachment://${attachmentName}`);
				}
			} else {
				const attachmentName = "face.png";
				let img = fetchPlayerFace(player.uuid);

				const width = 35;
				let str = "```ml\n";
				str += spaceBetween("Joined:", `${makeDateFriendly(player.meta.firstJoin)}`, width) + "\n";
				if (player.meta.location.online) {
					str += spaceBetween("Current World:", player.meta.location.server, width) + "\n";
				} else {
					str += spaceBetween("Last Seen:", `${makeDateFriendly(player.meta.lastJoin)}`, width) + "\n";
				}
				str += spaceBetween("Rank:", (player.meta.tag.value !== null) ? player.meta.tag.value : "Player", width) + "\n\n";
				const guildStatus = (player.guild.name !== null) ? `${toTitleCase(player.guild.rank)} of ${player.guild.name}` : "no guild";
				str += " ".repeat((width - guildStatus.length) / 2) + guildStatus + " ".repeat((width - guildStatus.length) / 2) + "\n\n";
				str += " ".repeat((width - 20) / 2) + "---- Statistics ----" + " ".repeat((width - 20) / 2) + "\n\n";
				str += spaceBetween("Total Level:", spaceNumber(player.global.totalLevel.combined), width) + "\n";
				str += spaceBetween("Combat Total:", spaceNumber(player.global.totalLevel.combat), width) + "\n";
				str += spaceBetween("Profession Total:", spaceNumber(player.global.totalLevel.profession), width) + "\n";
				//i For why the playtime is multiplied by 4.7 check https://github.com/Wynncraft/WynncraftAPI/issues/56
				str += spaceBetween("Playtime:", asHours(Math.floor(player.meta.playtime * 4.7)), width) + "\n";
				str += spaceBetween("Logins:", spaceNumber(player.global.logins), width) + "\n";
				str += spaceBetween("Deaths:", spaceNumber(player.global.deaths), width) + "\n";
				str += spaceBetween("Chests Opened:", spaceNumber(player.global.chestsFound), width) + "\n";
				str += spaceBetween("Mobs Killed:", spaceNumber(player.global.mobsKilled), width) + "\n";
				str += spaceBetween("Distance Traveled:", asDistance(player.global.blocksWalked), width) + "\n";
				str += "```";
				embed.setDescription(str);

				img = await img;
				if (img !== null) {
					const attachment = new MessageAttachment(img, attachmentName);
					message.files = [attachment];
				}
				embed.setAuthor(`Player Stats for ${player.username}`, `attachment://${attachmentName}`, `https://wynncraft.com/stats/player/${player.username}`);
			}
			forumData = await forumData;
			if (forumData !== null) {
				embed.addField("\u200b", `[Forum page](https://forums.wynncraft.com/members/${forumData.id}) (${forumData.username})`);
			}
			msg.channel.send(message);
		} catch (e) {
			msg.channel.send({embeds: [createErrorEmbed(`Failed to retrieve player stats for ${args[0]}`, "")]});
			console.log(`Error code: ${code}`);
			console.log(e);
		}
	}
};