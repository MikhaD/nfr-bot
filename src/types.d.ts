import { ApplicationCommandManager, Client, CommandInteraction, GuildApplicationCommandManager, MessageEmbed, NewsChannel, TextChannel, ThreadChannel } from "discord.js";

export interface customClient extends Client {
	commands?: Map<string, Command>,
	appCmdManager?: ApplicationCommandManager | GuildApplicationCommandManager;
}

export type ServerTextChannel = TextChannel | NewsChannel | ThreadChannel;

export type Command = {
	name: string,
	description: string,
	ephemeral: boolean,
	perms: Permission[],
	cooldown: number,
	cooldowns?: Map<string, number>,
	server?: string,
	options: CommandOption[],
	category?: string, 
	execute(interaction: CommandInteraction): Promise<void>,
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

export interface EmbedPages {
	index: number;
	pages: (MessageEmbed | EmbedPages)[];
	setThumbnail: (url: string) => any;
	nextPage(): MessageEmbed | null;
	previousPage(): MessageEmbed | null;
	firstPage(): MessageEmbed | null;
	lastPage(): MessageEmbed | null;
}

export type WynnRank = "RECRUIT" | "RECRUITER" | "CAPTAIN" | "STRATEGIST" | "CHIEF" | "OWNER";

export type WynnGuildMember = {
	name: string;
	uuid: string;
	rank: WynnRank;
	contributed: number;
	joined: string;
	joinedFriendly: string;
}

export type WynnGuildObject = {
	name: string;
	prefix: string;
	members: WynnGuildMember[];
	xp: number;
	level: number;
	created: string;
	createdFriendly: string;
	territories: number;
	banner: BannerData | null;
	request: {timestamp: number, version: number};
	error?: string;
}

export type WynnGuildError = {error: string}

export type WynnPlayerObject = {
	username: string;
	uuid: string;
	rank: "Player" | "Builder" | "Administrator";
	meta: {
		firstJoin: string;
		lastJoin: string;
		location: {
			online: boolean;
			server: string | null;
		};
		playtime: number;
		tag: {
			display: boolean;
			value: Rank;
		};
		veteran: boolean;
	}
	guild: {
		name: string | null;
		rank: string | null;
	}
	global: {
		chestsFound: number;
		blocksWalked: number;
		itemsIdentified: number;
		mobsKilled: number;
		totalLevel: {
			combat: number;
			profession: number;
			combined: number;
		}
		pvp: {
			kills: number;
			deaths: number;
		}
		logins: number;
		deaths: number;
		discoveries: number;
		eventsWon: number;
	}
}

export type WynnAPIPlayer = {
	kind: string;
	code: number;
	timestamp: number;
	version: string;
	data: WynnPlayerObject[];
}

export type BannerColor = "WHITE" | "LIGHT_GRAY" | "GRAY" | "BLACK" | "YELLOW" | "ORANGE" | "RED" | "BROWN" | "LIME" | "GREEN" | "LIGHT_BLUE" | "CYAN" | "BLUE" | "PINK" | "MAGENTA" | "PURPLE";

export type BannerPattern = "BORDER" | "BRICKS" | "CIRCLE_MIDDLE" | "CREEPER" | "CROSS" | "CURLY_BORDER" | "DIAGONAL_LEFT" | "DIAGONAL_LEFT_MIRROR" | "DIAGONAL_RIGHT" | "DIAGONAL_RIGHT_MIRROR" | "FLOWER" | "GLOBE" | "GRADIENT" | "GRADIENT_UP" | "HALF_HORIZONTAL" | "HALF_HORIZONTAL_MIRROR" | "HALF_VERTICAL" | "HALF_VERTICAL_MIRROR" | "MOJANG" | "NAMES" | "NAMES.PY" | "RHOMBUS_MIDDLE" | "SKULL" | "SNOUT" | "SQUARE_BOTTOM_LEFT" | "SQUARE_BOTTOM_RIGHT" | "SQUARE_TOP_LEFT" | "SQUARE_TOP_RIGHT" | "STRAIGHT_CROSS" | "STRIPE_BOTTOM" | "STRIPE_CENTER" | "STRIPE_DOWNLEFT" | "STRIPE_DOWNRIGHT" | "STRIPE_LEFT" | "STRIPE_MIDDLE" | "STRIPE_RIGHT" | "STRIPE_SMALL" | "STRIPE_TOP" | "TRIANGLES_BOTTOM" | "TRIANGLES_TOP" | "TRIANGLE_BOTTOM" | "TRIANGLE_TOP";

export type BannerLayer = { colour: BannerColor, pattern: BannerPattern };

export type BannerData = {
	base: BannerColor;
	tier?: number;
	structure?: string;
	layers: BannerLayer[];
}

export type MojangAPIProfileResponse = {
	id: string;
	name: string;
	properties: {name: string, value: string}[]
}

export type MojangApiProfileValueObject = {
	timestamp: number;
	profileId: string,
	profileName: string,
	textures: {
	  SKIN: {
		url: string;
	  }
	}
}

export type Rank = "CHAMPION" | "HERO" | "VIP+" | "VIP" | null;