// author = shokkunn

import winston from 'winston'
import { Levels } from './utils/logging/Utils'
import LogTransport from './utils/logging/Logging'
import { ChannelType, Client, Collection, CommandInteraction, Events, GatewayIntentBits, IntentsBitField, Interaction, Partials } from 'discord.js';
import DiscordListenerHandler from './discord/abstracts/listeners/DiscordListenerHandler';

// configure logger
winston.configure({
    "levels": Levels,
    "format": winston.format.combine(
        winston.format.timestamp()),
    transports: new LogTransport({ level: "debug" })
});

const client = new Client({
    "intents": [
        IntentsBitField.Flags.DirectMessages,
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildPresences,
        IntentsBitField.Flags.GuildWebhooks
    ]
})

const Listener = new DiscordListenerHandler({
    "client": client,
    "directory": "./src/listeners"
})

Listener.on("load", (listener) => console.log(`Loaded listener ${listener.id}`))

await Listener.registerAllModules()
Listener.listen()

client.login(process.env.BOT_TOKEN)