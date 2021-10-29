"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const path_1 = __importDefault(require("path"));
const pkg = require("../../../package.json");
const fs_1 = require("fs");
const Embed_1 = __importDefault(require("../../utility/Embed"));
const logsPath = path_1.default.join(__dirname, "../../../changelogs");
const versions = (0, fs_1.readdirSync)(logsPath);
const choices = [];
for (const version of versions.reverse()) {
    choices.push({
        name: `${version.slice(0, -3)}`,
        value: `${version.slice(0, -3)}`
    });
}
exports.command = {
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
        const changelog = new Embed_1.default(`Version ${version} changelog:`, (0, fs_1.readFileSync)(`${logsPath}/${version}.txt`).toString());
        changelog.setAuthor(`Current version: ${pkg.version}`, interaction.client.user?.avatarURL() || undefined);
        await interaction.followUp({ embeds: [changelog] });
    }
};
