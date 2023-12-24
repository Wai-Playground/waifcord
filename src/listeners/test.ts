// author = shokkunn

import { Client, Message } from "discord.js";
import DiscordListener from "../struts/discord/listeners/DiscordListener";

export default class TestModule extends DiscordListener {
    constructor() {
        super("test", {
            "event": "messageCreate"
        });
    }

    i = 0;

    override async execute(client: Client, message: Message<boolean>): Promise<any> {
        if (message.author.bot) return;
        message.channel.send("hi " + this.i)
        this.i++;
        if (this.i > 3) await this.reload();
    }
}