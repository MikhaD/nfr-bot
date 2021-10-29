"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
exports.command = {
    name: "flip",
    description: "Flip a 50/50 coin",
    ephemeral: false,
    perms: [],
    cooldown: 0,
    options: [],
    async execute(interaction) {
        await interaction.followUp((Math.random() >= 0.5) ? "heads" : "tails");
    },
};
