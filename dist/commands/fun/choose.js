import { randint } from "../../utility/utility.js";
export const command = {
    name: "choose",
    description: "Choose one of the provided options at random",
    ephemeral: false,
    perms: [],
    cooldown: 0,
    options: [{
            name: "options",
            type: "STRING",
            description: "A list of space seperated options. Strings in inverted commas count as one option",
            required: true
        }],
    async execute(interaction) {
        let comma = "";
        let args = [];
        let str = "";
        const options = interaction.options.getString("options").replaceAll(/\s+/g, " ");
        for (let i = 0; i < options.length; ++i) {
            if (!comma) {
                if (["'", "\""].includes(options[i]) || options[i] === " ") {
                    if (["'", "\""].includes(options[i])) {
                        comma = options[i];
                    }
                    (str !== "") ? args.push(str) : false;
                    str = "";
                }
                else {
                    str += options[i];
                }
            }
            else {
                if (options[i] === comma) {
                    (str !== "") ? args.push(str) : false;
                    str = "";
                    comma = "";
                }
                else {
                    str += options[i];
                }
            }
        }
        if (str !== "")
            args.push(str);
        await interaction.followUp(`${args[randint(args.length)]}`);
    },
};
