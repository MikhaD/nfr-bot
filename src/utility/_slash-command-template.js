module.exports = {
	name: "",
	description: "",
	options: [{
		name: "",
		type: "STRING",
		description: "",
		required: false
	}],
	example: "",
	cooldown: 5,
	permissions: ["ADMINISTRATOR"],
	execute(interaction) {
		return interaction.followUp("No code here yet");
	}
};
// The type options:
// https://v13-prep.discordjs.guide/interactions/registering-slash-commands.html#option-types

// Lists of choices for STRING and INTEGER types
// https://v13-prep.discordjs.guide/interactions/registering-slash-commands.html#choices