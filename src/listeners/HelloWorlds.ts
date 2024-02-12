// author = shokkunn

import { ActivityType, Client } from "discord.js";
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
        winston.log("success", `Ready! Logged in as ${client.user?.username}! (ID: ${client.user?.id})`);
        client.user?.setActivity("mario kart", { type: ActivityType.Competing })
    }
}