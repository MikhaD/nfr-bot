module.exports = {
	name: "flip",
	description: "Flip a 50/50 coin",

	async execute(interaction) {
		await interaction.followUp((Math.random() >= 0.5) ? "heads" : "tails");
	}
};