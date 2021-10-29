"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const utility_1 = require("../../utility/utility");
const config_json_1 = __importDefault(require("../../config.json"));
exports.command = {
    name: "roll",
    description: "Roll a dice with x number of sides, 6 by default",
    ephemeral: false,
    perms: [],
    cooldown: 0,
    options: [{
            name: "sides",
            type: "INTEGER",
            description: "The number of sides on the die",
            required: false
        }],
    async execute(interaction) {
        const sides = interaction.options.getInteger("sides") || config_json_1.default.defualt_dice;
        await interaction.followUp(`${(0, utility_1.randint)(sides) + 1}`);
    },
};
