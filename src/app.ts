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