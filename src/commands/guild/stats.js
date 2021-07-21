const { fetchPlayer, createErrorEmbed, createSimpleEmbed, toTitleCase, makeDateFriendly, spaceNumber, asHours, asDistance, createRankImage } = require("../../utility/_utility");
const config = require("../../config.json");

module.exports = {
	name: "stats",
	aliases: ["player", "p"],
	args: {
		required: ["name"],
		optional: [""]
	},
	description: "Fetch the statistics of a given player",
	example: "stats Invinci",
	cooldown: 5,
	permissions: [""],

	async execute(msg, args) {
		const thumbnailScale = 80;
		const { code, data } = await fetchPlayer(args[0]);
		try {
			const player = data[0];

			const embed = createSimpleEmbed(
				`Player Stats for ${player.username}`,
				(player.guild.name !== null) ? `${toTitleCase(player.guild.rank)} of **${player.guild.name}**`
					: "*Not part of a guild*"
			);
			embed.setColor((player.rank === "Player") ? config.colors.tag[player.meta.tag.value] : config.colors.rank[player.rank]);

			embed.setURL(`https://wynncraft.com/stats/player/${player.username}`);

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

			embed.addField("Playtime:", asHours(player.meta.playtime), true);
			embed.addField("Logins:", spaceNumber(player.global.logins), true);
			embed.addField("Deaths:", spaceNumber(player.global.deaths), true);

			embed.addField("\u200b", "\u200b");

			embed.addField("Chests Opened:", spaceNumber(player.global.chestsFound), true);
			embed.addField("Mobs Killed:", spaceNumber(player.global.mobsKilled), true);
			embed.addField("Distance Traveled:", asDistance(player.global.blocksWalked), true);

			// embed.attachFiles([`https://visage.surgeplay.com/bust/${thumbnailScale}/${player.uuid.replaceAll("-", "")}.png`]);
			embed.attachFiles([await createRankImage(player.uuid.replaceAll("-", ""), player.meta.tag.value)]);
			embed.setThumbnail(`attachment://${player.uuid.replaceAll("-", "")}`);

			msg.channel.send(embed);
		} catch (e) {
			msg.channel.send(createErrorEmbed(`Failed to retrieve player stats for ${args[0]}`, ""));
			console.log(`Error code: ${code}`);
			console.log(e);
		}
	}
};