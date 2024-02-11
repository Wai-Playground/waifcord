// author = shokkunn

import { Client } from "discord.js";
import DiscordListenerClass from "../structs/discord/events/Listener";
import winston from "winston";

export default class HelloWorld extends DiscordListenerClass {
    constructor() {
        super("helloWorld", {
            "event": "ready",
            "once": true
        });
    }

    public async execute(client: Client) {
        winston.log("info", `Ready! Logged in as ${client.user?.username}! (ID: ${client.user?.id})`);
    }
}