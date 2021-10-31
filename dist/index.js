import { readdirSync } from "fs";
import { Client, GuildMember } from "discord.js";
import { parsePermissions } from "./utility/utility.js";
import { ErrorEmbed } from "./utility/Embed.js";
import config from "./config.js";
import { fileURLToPath } from 'url';
const __dirname = fileURLToPath(new URL(".", import.meta.url));
const client = new Client({
    partials: ["MESSAGE", "REACTION", "CHANNEL"],
    intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MESSAGE_REACTIONS", "DIRECT_MESSAGES", "DIRECT_MESSAGE_REACTIONS"]
});
const commands = new Map();
client.commands = commands;
const helpChoices = [];
for (const dir of readdirSync(`${__dirname}/commands`).filter(dir => /^[^_].*$/.test(dir))) {
    for (const file of readdirSync(`${__dirname}/commands/${dir}`).filter(file => /^[^_].*\.js$/.test(file))) {
        const command = (await import(`./commands/${dir}/${file}`)).command;
        command.category = dir;
        if (command.cooldown > 0)
            command.cooldowns = new Map();
        commands.set(command.name, command);
        if (command.category !== "dev")
            helpChoices.push({ name: `/${command.name}`, value: command.name });
    }
}
const help = commands.get("help");
if (help) {
    help.options[0].choices = helpChoices;
}
client.once("ready", async () => {
    client.appCmdManager = client.guilds.cache.get(config.dev_guild_id).commands;
    client.user?.setActivity("/help", { type: "PLAYING" });
    await client.appCmdManager.set(Array.from(commands, el => el[1]));
    console.log(`${client.user?.tag} has logged in.`);
});
client.on("messageCreate", async (msg) => {
    if (msg.author.bot || !msg.content.startsWith(config.prefix))
        return;
    msg.reply({ content: `${config.prefix} commands are depricated, use / instead. Do /help for help` });
});
client.on("interactionCreate", async (interaction) => {
    if (interaction.isCommand()) {
        try {
            const command = commands.get(interaction.commandName);
            if (command && interaction.member instanceof GuildMember) {
                const id = interaction.member.id;
                if (command.category === "dev" && id !== config.developer_id) {
                    return interaction.reply({ content: `⛔ /${command.name} is a developer command, you may not use it`, ephemeral: true });
                }
                if (command.perms) {
                    if (interaction.inGuild()) {
                        const authorPerms = interaction.channel?.permissionsFor(interaction.member);
                        if (!authorPerms || !authorPerms.has(command.perms)) {
                            return interaction.reply({ content: `⛔ ${parsePermissions(command.perms)} is required to use this command`, ephemeral: true });
                        }
                    }
                    else {
                        return interaction.reply({ content: "⛔ This command is server only and cannot be used in dms or group dms", ephemeral: true });
                    }
                }
                if (command.cooldowns) {
                    const now = Date.now();
                    const cooldown = command.cooldown * 1000;
                    if (command.cooldowns.has(id)) {
                        const expirationTime = command.cooldowns.get(id) + cooldown;
                        if (now < expirationTime) {
                            return interaction.reply({ content: `🕙 You can only use this command once every ${command.cooldown} seconds,\nyou have ${Math.round((expirationTime - now) / 1000)} seconds until you can use it again`, ephemeral: true });
                        }
                    }
                    command.cooldowns.set(id, now);
                    setTimeout(() => command.cooldowns?.delete(id), cooldown);
                }
                if (interaction.options.getBoolean("ephemeral") || command.ephemeral) {
                    await interaction.deferReply({ ephemeral: true });
                }
                else {
                    await interaction.deferReply();
                }
                await command.execute(interaction);
            }
        }
        catch (e) {
            console.log(e);
            const err = new ErrorEmbed("Failed to execute command", e);
            await interaction.followUp({ embeds: [err], ephemeral: true });
        }
    }
});
(await import("dotenv")).config();
client.login(process.env["TOKEN"]);
