module.exports = {
	name: "",
	description: "",
	ephemeral: false,
	options: [{
		name: "example",
		type: "STRING",
		description: "",
		required: false
	}],

	async execute(interaction) {
		const arg = interaction.options.getString("example");
		await interaction.followUp("No code here yet");
	}
};
//? Convention: Lowercase names for options, with no full stop


// The type options:
// https://discordjs.guide/interactions/registering-slash-commands.html#option-types

// Lists of choices for STRING and INTEGER types
// https://discordjs.guide/interactions/registering-slash-commands.html#choices