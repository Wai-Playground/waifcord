// author = shokkunn

import { Client, Message } from "discord.js";
import BaseFunctionTool from "../agent/abstracts/tools/BaseTool";
import BaseModule from "../base/BaseModule";
import DiscordListener from "../discord/abstracts/listeners/DiscordListener";

export default class TestModule extends DiscordListener {
    constructor() {
        super("test", {
            "event": "messageCreate"
        });
    }

    override async execute(client: Client, message: Message<boolean>): Promise<any> {
        message.channel.send(client.channels.cache.size.toString());
    }
}