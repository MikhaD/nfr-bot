import Collection from "@discordjs/collection";
import { Interaction } from "discord.js";

export type Command = {
	name: string,
	description: string,
	ephemeral: boolean,
	perms: Permission[],
	cooldown: number,
	cooldowns?: Collection<string, number>,
	options: CommandOption[],
	execute: (interaction: Interaction) => void,
	category?: string, 
	server?: string,
}

export type CommandOption = {
	name: string,
	description: string,
	type: CommandOptionType,
	required: boolean,
	choices?: CommandOptionChoice[]
}

export type CommandOptionType = "SUB_COMMAND" | "SUB_COMMAND_GROUP" | "STRING" | "INTEGER" | "NUMBER" | "BOOLEAN" | "USER" | "CHANNEL" | "ROLE" | "MENTIONABLE";

export type CommandOptionChoice = {
	name: string,
	value: string | number;
}

export type Permission = "CREATE_INSTANT_INVITE" | "KICK_MEMBERS" | "BAN_MEMBERS" | "ADMINISTRATOR" | "MANAGE_CHANNELS" | "MANAGE_GUILD" | "ADD_REACTIONS" | "VIEW_AUDIT_LOG" | "PRIORITY_SPEAKER" | "STREAM" | "VIEW_CHANNEL" | "SEND_MESSAGES" | "SEND_TTS_MESSAGES" | "MANAGE_MESSAGES" | "EMBED_LINKS" | "ATTACH_FILES" | "READ_MESSAGE_HISTORY" | "MENTION_EVERYONE" | "USE_EXTERNAL_EMOJIS" | "VIEW_GUILD_INSIGHTS" | "CONNECT" | "SPEAK" | "MUTE_MEMBERS" | "DEAFEN_MEMBERS" | "MOVE_MEMBERS" | "USE_VAD" | "CHANGE_NICKNAME" | "MANAGE_NICKNAMES" | "MANAGE_ROLES" | "MANAGE_WEBHOOKS" | "MANAGE_EMOJIS_AND_STICKERS" | "USE_APPLICATION_COMMANDS" | "REQUEST_TO_SPEAK" | "MANAGE_THREADS" | "CREATE_PUBLIC_THREADS" | "CREATE_PRIVATE_THREADS" | "USE_EXTERNAL_STICKERS" | "SEND_MESSAGES_IN_THREADS" | "START_EMBEDDED_ACTIVITIES"

export function execute(interaction: Interaction): void