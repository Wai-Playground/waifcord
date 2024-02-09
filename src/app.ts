import winston from "winston";
import { Levels } from "./utils/logging/Utils";
import ConsoleTransport from "./utils/logging/Logging";
import {
  ChannelType,
  Collection,
  CommandInteraction,
  Events,
  GatewayIntentBits,
  IntentsBitField,
  Interaction,
  Partials,
} from "discord.js";

winston.configure({
  levels: Levels,
  format: winston.format.combine(winston.format.timestamp()),
  transports: new ConsoleTransport({ level: "debug" }),
});


winston.log("info", "Hello, world!");