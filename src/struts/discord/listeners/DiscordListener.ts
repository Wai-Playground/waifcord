// author = shokkunn

import { ClientEvents } from "discord.js";
import BaseModule from "../../base/BaseModule";
import DiscordListenerHandler from "./DiscordListenerHandler";

export default abstract class DiscordListener extends BaseModule {
    declare protected _options: DiscordListenerOptions;
    declare public handler: DiscordListenerHandler | null;
    declare public boundExecute: (...args: any[]) => Promise<any>;
    
    constructor(id: string, options: DiscordListenerOptions) {
        super(id);
        this._options = options;
    }

    get options(): DiscordListenerOptions {
        return this._options;
    }

    get event() {
        return this.options.event;
    }
    
    async execute(...args: any[]) {
        throw new Error(`Method Not Implemented`);
    }
}

/** Types */

interface DiscordListenerOptions {
    event: keyof ClientEvents;
    once?: boolean;
}