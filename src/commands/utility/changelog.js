const path = require("path");
const pkg = require(path.join(__dirname, "../../../package.json"));
const { readdirSync, readFileSync } = require("fs");
const { Embed } = require("../../utility/Embed");

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
	cooldown: 5,
	perms: ["MANAGE_GUILD"],
	options: [{
		name: "version",
		type: "STRING",
		description: "the version you wish to display the changelog for",
		required: true,
		choices: choices
	}],

	async execute(interaction) {
		const version = interaction.options.getString("version");

		const changelog = new Embed(
			`Version ${version} changelog:`,
			readFileSync(`${logsPath}/${version}.txt`).toString()
		);

		changelog.setAuthor(`Current version: ${pkg.version}`, interaction.client.user.avatarURL());

		await interaction.followUp({embeds: [changelog]});
	}
};