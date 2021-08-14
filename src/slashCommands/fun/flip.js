module.exports = {
	name: "flip",
	description: "Flip a 50/50 coin.",

	execute: function(interaction) {
		interaction.followUp((Math.random() >= 0.5) ? "heads" : "tails");
	}
};