// author = shokkunn

import { Client } from "discord.js";
import BaseHandler, { BaseHandlerOptions } from "../../../base/BaseHandler";
import DiscordListener from "./DiscordListener";

export default class DiscordListenerHandler extends BaseHandler {
    declare protected _options: DiscordListenerHandlerOptions;
    declare protected _modules: Map<string, DiscordListener>;

    constructor(options: DiscordListenerHandlerOptions) {
        super(options)
    }

    override get modules(): Map<string, DiscordListener> {
        return this._modules;
    }

    override get options(): DiscordListenerHandlerOptions {
        return this._options;
    }

    listen() {
        for (const listener of this.modules.values()) {
            try {
                if (listener.options.once) {
                    this.options.client.once(listener.event, listener.execute.bind(listener, this.options.client));
                } else {
                    this.options.client.on(listener.event, listener.execute.bind(listener, this.options.client));
                }
            } catch (error) {
                throw new Error(`Failed to listen to event ${listener.event}:\n${error}`);
            }
        }
    }

    stop() {
        for (const listener of this.modules.values()) {
            try {
                this.options.client.off(listener.event, listener.execute.bind(listener));
            } catch (error) {
                throw new Error(`Failed to stop listening to event ${listener.event}:\n${error}`);
            }
        }
    }
}

/** Types */

export interface DiscordListenerHandlerOptions extends BaseHandlerOptions {
    listeners?: DiscordListener[];
    client: Client;
}