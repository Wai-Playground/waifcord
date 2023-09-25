// author = shokkunn

import winston from 'winston'
import { Levels } from './utils/logging/winston'
import LogTransport from './utils/logging/logTransport'

// configure logger
winston.configure({
    "levels": Levels,
    "format": winston.format.combine(
        winston.format.timestamp()),
    transports: new LogTransport({ level: "debug" })
});