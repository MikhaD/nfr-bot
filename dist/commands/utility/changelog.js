import path from 'path';
import { readdirSync, readFileSync } from "fs";
import Embed from "../../utility/Embed.js";
import { fileURLToPath } from 'url';
const __dirname = fileURLToPath(new URL(".", import.meta.url));
const logsPath = path.join(__dirname, "../../../changelogs");
const currentVersion = JSON.parse(readFileSync(path.join(__dirname, "../../../package.json")).toString())?.version;
const versions = readdirSync(logsPath);
const choices = [];
for (const version of versions.reverse()) {
    choices.push({
        name: `${version.slice(0, -3)}`,
        value: `${version.slice(0, -3)}`
    });
}
export const command = {
    name: "changelog",
    description: "Display the list of changes for a given version, latest by default",
    ephemeral: false,
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
        const changelog = new Embed(`Version ${version} changelog:`, readFileSync(`${logsPath}/${version}.md`).toString());
        changelog.setAuthor(`Current version: ${currentVersion}`, interaction.client.user?.avatarURL() || undefined);
        await interaction.followUp({ embeds: [changelog] });
    }
};
