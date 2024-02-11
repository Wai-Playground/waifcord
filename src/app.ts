// author = shokkunn

import winston from "winston";
import ConsoleTransport, { Levels } from "./utils/logging/Transport";
import { Client, IntentsBitField } from "discord.js";
import CustomClient from "./structs/discord/client/Client";

winston.configure({
	levels: Levels,
	format: winston.format.combine(winston.format.timestamp()),
	transports: new ConsoleTransport({ level: Bun.env.LOG_LEVEL || "info" }),
});

const WaifClient = new CustomClient({
	intents: [
		IntentsBitField.Flags.DirectMessages,
		IntentsBitField.Flags.Guilds,
		IntentsBitField.Flags.GuildMessages,
		IntentsBitField.Flags.MessageContent,
		IntentsBitField.Flags.GuildMembers,
		IntentsBitField.Flags.GuildPresences,
		IntentsBitField.Flags.GuildWebhooks,
	],
});

if (!Bun.env.BOT_TOKEN) throw new Error("BOT_TOKEN not set in .env");
if (!Bun.env.BOT_CLIENT_ID) throw new Error("CLIENT_ID not set in .env");

await WaifClient.setup();
await WaifClient.getInteractionHandler().uploadToDiscord(
	Bun.env.BOT_TOKEN,
	Bun.env.BOT_CLIENT_ID,
	Bun.env.GUILD_ID
);
await WaifClient.login(Bun.env.BOT_TOKEN);

export default WaifClient;
