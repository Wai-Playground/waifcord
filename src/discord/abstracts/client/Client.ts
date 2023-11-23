// author = shokkunn

import { Client } from "discord.js";

export default class CustomClient extends Client {
    cooldowns: Map<string, Map<string, number>> = new Map();
}