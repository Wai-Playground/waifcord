// author = shokkunn

import winston from 'winston'
import { Levels } from './utils/logging/Utils'
import LogTransport from './utils/logging/Logging'
import { ChannelType, Client, Collection, CommandInteraction, Events, GatewayIntentBits, IntentsBitField, Interaction, Partials } from 'discord.js';
import DiscordListenerHandler from './discord/abstracts/listeners/DiscordListenerHandler';
import { listen } from 'bun';
import { prisma } from './utils/Database';

// configure logger
winston.configure({
    "levels": Levels,
    "format": winston.format.combine(
        winston.format.timestamp()),
    transports: new LogTransport({ level: "debug" })
});

const client = new Client({
    intents: [
        IntentsBitField.Flags.DirectMessages,
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildPresences,
        IntentsBitField.Flags.GuildWebhooks
    ]
})

const listenerHandler = new DiscordListenerHandler({
    "client": client,
    "directory": "./src/listeners"
})

listenerHandler.on("load", (listener) => {
    winston.info(`Loaded listener ${listener.id}`)
});

await listenerHandler.registerAllModules();

client.on("ready", () => {
    winston.info(`Logged in as ${client.user?.tag}!`);
});

client.login(process.env.BOT_TOKEN);

