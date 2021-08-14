const path = require("path");
const { createErrorEmbed } = require(path.join(__dirname, "../../utility/utility"));
const config = require(path.join(__dirname, "../../config.json"));
const pkg = require(path.join(__dirname, "../../../package.json"));
const { readdirSync, readFileSync } = require("fs");
const { MessageEmbed } = require("discord.js");

module.exports = {
	name: "changelog",
	args: {
		optional: ["version"]
	},
	description: "Display the list of changes for a given version. If no version is given all changelogs will be shown.",
	example: "changelog",
	cooldown: 5,
	permissions: ["ADMINISTRATOR"],

	execute(msg, args) {
		const logsPath = path.join(__dirname, "../../../changelogs");
		const versions = readdirSync(logsPath);
		const changelog = new MessageEmbed();
		if (args.length > 0) {
			if (versions.includes(`${args[0]}.txt`)) {
				changelog.setTitle(`Version ${args[0]} changelog:`);
				changelog.setDescription(readFileSync(`${logsPath}/${args[0]}.txt`).toString());
				changelog.setAuthor(`Current version: ${pkg.version}`);
			} else {
				msg.channel.send({embeds: [createErrorEmbed("", `${args[0]} is not a valid version number`)]});
				return;
			}
		} else {
			for (const version of versions) {
				changelog.addField(`Version ${version.slice(0, -4)} changelog:`, readFileSync(`${logsPath}/${version}`).toString());
			}
		}
		changelog.setThumbnail(msg.client.user.avatarURL());
		changelog.setColor(config.colors.embed.default);
		msg.channel.send({embeds: [changelog]});
	}
};