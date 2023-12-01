// author = shokkunn

import { Message } from "discord.js";
import BaseFunctionTool from "../agent/abstracts/tools/BaseTool";
import BaseModule from "../base/BaseModule";
import DiscordListener from "../discord/abstracts/listeners/DiscordListener";

export default class TestModule extends DiscordListener {
    constructor() {
        super("test", {
            "event": "messageCreate"
        });
    }

    override async execute(message: Message<boolean>): Promise<any> {
        console.log(message.content)
    }
}