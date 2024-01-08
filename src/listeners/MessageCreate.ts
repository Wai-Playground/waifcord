// author = shokkunn

import { Client, Message } from "discord.js";
import DiscordListener from "../struts/discord/listeners/DiscordListener";
import winston from "winston";
import StageRunnerClass from "../struts/agent/stage_runner/StageRunner";

export default class MessageCreate extends DiscordListener {
    constructor() {
        super("test", {
            "event": "messageCreate"
        });
    }

    override async execute(client: Client, message: Message ): Promise<any> {
        try {
            await StageRunnerClass.handleMessage(message);
        } catch (e) {
            winston.error("Failed to handle message: " + e);
        }
    }
}