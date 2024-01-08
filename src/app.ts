// author = shokkunn

import winston from 'winston'
import { Levels } from './utils/logging/Utils'
import ConsoleTransport from './utils/logging/Logging'
import { ChannelType, Client, Collection, CommandInteraction, Events, GatewayIntentBits, IntentsBitField, Interaction, Partials } from 'discord.js';
import LTMUtils from './memory/LTMUtils';
import DiscordListenerHandler from './struts/discord/listeners/DiscordListenerHandler';

// configure logger
winston.configure({
    "levels": Levels,
    "format": winston.format.combine(
        winston.format.timestamp()),
    transports: new ConsoleTransport({ level: "debug" })
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

await LTMUtils.validateRedisHealth();

// load listeners

const listeners = new DiscordListenerHandler({
    client: client,
    directory: "src/listeners/"
})

await listeners.registerAllModules();

client.login(process.env.BOT_TOKEN);

export default client;
export { listeners };