import { fetchPlayer, toTitleCase, makeDateFriendly, spaceNumber, asHours, asDistance, createRankImage, spaceBetween, fetchPlayerFace, fetchForumData } from "../../utility/utility";
import config from "../../config.json";
import { HexColorString, MessageAttachment, MessageEmbed } from "discord.js";
import { ErrorEmbed } from "../../utility/Embed";
import { Command } from "../../types";

export const command: Command = {
	name: "stats",
	description: "Show the statistics of a given player, list by default",
	cooldown: 5,
	ephemeral: false,
	perms: [],
	options: [{
		name: "name",
		type: "STRING",
		description: "Player's name",
		required: true
	},
	{
		name: "formatted",
		type: "BOOLEAN",
		description: "Whether the stats are formatted (instead of a list)",
		required: false
	}],
	async execute(interaction) {
		const name = interaction.options.getString("name")!;
		const formatted = interaction.options.getBoolean("formatted");

		const { code, data } = await fetchPlayer(name);
		try {
			const player = data[0];

			const message = {
				embeds: new Array(),
				files: new Array()
			};
			const embed = new MessageEmbed();
			message.embeds.push(embed);
			embed.setColor((player.rank === "Player" ? config.colors.tag[player.meta.tag.value || "null"] : config.colors.rank[player.rank]) as HexColorString);

			const forumDataPromise = fetchForumData(player.username);

			if (formatted) {
				embed.setTitle(`Player Stats for ${player.username}`);
				embed.setURL(`https://wynncraft.com/stats/player/${player.username}`);
				embed.setDescription((player.guild.name !== null) ? `${toTitleCase(player.guild.rank || "")} of **${player.guild.name}**` : "*Not part of a guild*");

				const attachmentName = "rankImage.png";
				const imgBuffer = createRankImage(player.uuid, player.meta.tag.value);

				if (player.meta.location.online) {
					embed.addField("Status:", "🟢 Online", true);
					embed.addField("Current World:", player.meta.location.server!, true);
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
				//info For why the playtime is multiplied by 4.7 check https://github.com/Wynncraft/WynncraftAPI/issues/56
				embed.addField("Playtime:", asHours(Math.floor(player.meta.playtime * 4.7)), true);
				embed.addField("Logins:", spaceNumber(player.global.logins), true);
				embed.addField("Deaths:", spaceNumber(player.global.deaths), true);

				embed.addField("\u200b", "\u200b");

				embed.addField("Chests Opened:", spaceNumber(player.global.chestsFound), true);
				embed.addField("Mobs Killed:", spaceNumber(player.global.mobsKilled), true);
				embed.addField("Distance Traveled:", asDistance(player.global.blocksWalked), true);

				const img = await imgBuffer;
				if (img !== null) {
					const attachment = new MessageAttachment(img, attachmentName);
					message.files.push(attachment);
					embed.setThumbnail(`attachment://${attachmentName}`);
				}
			} else {
				const attachmentName = "face.png";
				const imgBuffer = fetchPlayerFace(player.uuid);

				const width = 35;
				let str = "```ml\n";
				str += spaceBetween("Joined:", `${makeDateFriendly(player.meta.firstJoin)}`, width) + "\n";
				if (player.meta.location.online) {
					str += spaceBetween("Current World:", player.meta.location.server!, width) + "\n";
				} else {
					str += spaceBetween("Last Seen:", `${makeDateFriendly(player.meta.lastJoin)}`, width) + "\n";
				}
				str += spaceBetween("Rank:", (player.meta.tag.value !== null) ? player.meta.tag.value : "Player", width) + "\n\n";
				const guildStatus = (player.guild.name !== null) ? `${toTitleCase(player.guild.rank || "")} of ${player.guild.name}` : "no guild";
				str += " ".repeat((width - guildStatus.length) / 2) + guildStatus + " ".repeat((width - guildStatus.length) / 2) + "\n\n";
				str += " ".repeat((width - 20) / 2) + "---- Statistics ----" + " ".repeat((width - 20) / 2) + "\n\n";
				str += spaceBetween("Total Level:", spaceNumber(player.global.totalLevel.combined), width) + "\n";
				str += spaceBetween("Combat Total:", spaceNumber(player.global.totalLevel.combat), width) + "\n";
				str += spaceBetween("Profession Total:", spaceNumber(player.global.totalLevel.profession), width) + "\n";
				//info For why the playtime is multiplied by 4.7 check https://github.com/Wynncraft/WynncraftAPI/issues/56
				str += spaceBetween("Playtime:", asHours(Math.floor(player.meta.playtime * 4.7)), width) + "\n";
				str += spaceBetween("Logins:", spaceNumber(player.global.logins), width) + "\n";
				str += spaceBetween("Deaths:", spaceNumber(player.global.deaths), width) + "\n";
				str += spaceBetween("Chests Opened:", spaceNumber(player.global.chestsFound), width) + "\n";
				str += spaceBetween("Mobs Killed:", spaceNumber(player.global.mobsKilled), width) + "\n";
				str += spaceBetween("Distance Traveled:", asDistance(player.global.blocksWalked), width) + "\n";
				str += "```";
				embed.setDescription(str);

				const img = await imgBuffer;
				if (img !== null) {
					const attachment = new MessageAttachment(img, attachmentName);
					message.files = [attachment];
				}
				embed.setAuthor(`Player Stats for ${player.username}`, `attachment://${attachmentName}`, `https://wynncraft.com/stats/player/${player.username}`);
			}
			const forumData = await forumDataPromise;
			if (forumData !== null) {
				embed.addField("\u200b", `[Forum page](https://forums.wynncraft.com/members/${forumData.id}) (${forumData.username})`);
			}
			await interaction.followUp(message);
		} catch (e) {
			await interaction.followUp(new ErrorEmbed(`Failed to retrieve player stats for ${name}`));
			console.log(`Error code: ${code}`);
			console.log(e);
		}
	}
};