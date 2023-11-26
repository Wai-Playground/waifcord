// author = shokkunn

import winston from 'winston'
import { Levels } from './utils/logging/Utils'
import LogTransport from './utils/logging/Logging'
import { ChannelType, Client, Collection, CommandInteraction, Events, GatewayIntentBits, Interaction, Partials } from 'discord.js';

// configure logger
winston.configure({
    "levels": Levels,
    "format": winston.format.combine(
        winston.format.timestamp()),
    transports: new LogTransport({ level: "debug" })
});


/*
const openai = new OpenAI({
    "apiKey": process.env.OPENAI_API_KEY
});
*/