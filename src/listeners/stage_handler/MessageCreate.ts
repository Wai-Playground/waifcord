// author = shokkunn

import { Client, Message } from "discord.js";
import DiscordListenerClass from "../../structs/discord/events/Listener";
import winston from "winston";
import StageRunnerClass from "../../structs/stage/stages/StageRunner";
import StageUtilitiesClass from "../../structs/stage/stages/Utilities";

export default class MessageCreate extends DiscordListenerClass {
    constructor() {
        super("messageCreate", {
            "event": "messageCreate",
            "once": false
        });
    }

    public async execute(client: Client, message: Message) {
        try {
            StageUtilitiesClass.stringDirectedAt(message.content)
            await StageRunnerClass.handleMessage(message);
        } catch (error) {
            winston.error(`Error handling message: ${error}`);
        }
    }
}