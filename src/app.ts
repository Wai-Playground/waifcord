// author = shokkunn

import winston from "winston";
import ConsoleTransport, { Levels } from "./utils/logging/Transport";
import { Client } from "discord.js";

winston.configure({
  levels: Levels,
  format: winston.format.combine(winston.format.timestamp()),
  transports: new ConsoleTransport({ level: Bun.env.LOG_LEVEL || "info" }),
});

Client.on