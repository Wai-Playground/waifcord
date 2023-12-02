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

    i = 0;

    override async execute(client: Client, message: Message<boolean>): Promise<any> {
        this.i++;
        if (message.author.bot) return;
        message.channel.send("hi " + this.i)
        if (this.i == 3) this.deregister();
    }
}