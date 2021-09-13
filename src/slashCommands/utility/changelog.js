const path = require("path");
const config = require(path.join(__dirname, "../../config.json"));
const pkg = require(path.join(__dirname, "../../../package.json"));
const { readdirSync, readFileSync } = require("fs");
const { MessageEmbed } = require("discord.js");

const logsPath = path.join(__dirname, "../../../changelogs");
const versions = readdirSync(logsPath);
const choices = [];

for (const version of versions.reverse()) {
	choices.push({
		name: `${version.slice(0, -4)}`,
		value: `${version.slice(0, -4)}`
	});
}

module.exports = {
	name: "changelog",
	description: "Display the list of changes for a given version, latest by default",
	options: [{
		name: "version",
		type: "STRING",
		description: "the version you wish to display the changelog for",
		required: true,
		choices: choices
	}],
	perms: ["ADMINISTRATOR"],

	async execute(interaction) {
		const version = interaction.options.getString("version");

		const changelog = new MessageEmbed();

		changelog.setTitle(`Version ${version} changelog:`);
		changelog.setDescription(readFileSync(`${logsPath}/${version}.txt`).toString());
		changelog.setAuthor(`Current version: ${pkg.version}`, interaction.client.user.avatarURL());

		changelog.setColor(config.colors.embed.default);
		await interaction.followUp({embeds: [changelog]});
	}
};