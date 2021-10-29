"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const Embed_1 = __importDefault(require("../../utility/Embed"));
const MessageObject_1 = __importDefault(require("../../utility/MessageObject"));
const utility_1 = require("../../utility/utility");
const __1 = require("../..");
exports.command = {
    name: "help",
    description: "Show the help menu, or help info for a command",
    ephemeral: false,
    perms: [],
    cooldown: 0,
    options: [{
            name: "command",
            type: "STRING",
            description: "The command you want help with",
            required: false
        }],
    async execute(interaction) {
        const command = __1.global.commands.get(interaction.options.getString("command") || "");
        if (command) {
            const embed = new Embed_1.default(`/${command.name} help`, command.description);
            let syntax = `\`/${command.name}${(0, utility_1.parseArguments)(command)}\`\n`;
            if (command.options) {
                for (const option of command.options) {
                    syntax += `\`${option.name}\`: ${option.description}
					required: ${option.required}
					${(option.choices ? "choices: " + option.choices.reduce((str, c) => `${str}, ${c.name}`, "\b").slice(2) + "\n" : "")}`;
                }
            }
            embed.addField("Syntax", syntax);
            if (command.perms)
                embed.addField("Permissions", (0, utility_1.parsePermissions)(command.perms));
            if (command.cooldown)
                embed.addField("Cooldown", `${command.cooldown} seconds`);
            embed.setFooter(`\ncommand category: ${command.category}`);
            await interaction.followUp(embed);
        }
        else {
            const message = new MessageObject_1.default();
            const categories = new Map();
            for (const cmd of __1.global.commands) {
                if (cmd[1].category !== "dev") {
                    if (!categories.get(cmd[1].category)) {
                        categories.set(cmd[1].category, new Embed_1.default(`${cmd[1].category} commands`));
                    }
                    categories.get(cmd[1].category).addField(`/${cmd[0]} ${(0, utility_1.parseArguments)(cmd[1])}`, cmd[1].description);
                }
            }
            for (const embed of categories.values()) {
                message.addPage(embed);
            }
            message.watchMessage(await interaction.followUp(message));
        }
    }
};
