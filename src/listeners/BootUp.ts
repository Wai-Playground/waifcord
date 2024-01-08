// author = shokkunn

import { Client, Message } from "discord.js";
import DiscordListener from "../struts/discord/listeners/DiscordListener";
import winston from "winston";

export default class BootUp extends DiscordListener {
    constructor() {
        super("test", {
            "event": "ready"
        });
    }

    override async execute(client: Client): Promise<any> {
        winston.log("info", "Bot is ready! Logged in as " + client.user?.username);
    }
}