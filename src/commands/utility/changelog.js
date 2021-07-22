const { createSimpleEmbed, createErrorEmbed } = require("../../utility/_utility");
const pkg = require("../../../package.json");
const { readdirSync, readFileSync } = require("fs");
const path = require("path");
const { version } = require("canvas");


module.exports = {
	name: "changelog",
	args: {
		optional: ["version"]
	},
	description: "Display the list of changes for a given version. For the latest changelog don't specify a version",
	example: "changelog",
	cooldown: 3,
	permissions: ["ADMINISTRATOR"],

	execute(msg, args) {
		const logsPath = path.join(__dirname, "../../../changelogs");
		const versions = readdirSync(logsPath);
		let log, version;
		if (args.length > 0) {
			if (versions.includes(`${args[0]}.txt`)) {
				version = args[0];
				log = readFileSync(`${logsPath}/${version}.txt`).toString();
			} else {
				msg.channel.send(createErrorEmbed("", `${args[0]} is not a valid version number`));
				return;
			}
		} else {
			version = pkg.version;
			log = readFileSync(`${logsPath}/${pkg.version}.txt`).toString();
		}
		const changelog = createSimpleEmbed(`Changelog for version ${version}`, log);
		changelog.setAuthor(`Current version: ${pkg.version}`);
		changelog.setThumbnail(msg.client.user.avatarURL());
		msg.channel.send(changelog);
	}
};
