// author = shokkunn

import { Client } from "discord.js";
import BaseHandler, { BaseHandlerOptions } from "../../base/BaseHandler";
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

    /**
     * @name deregisterModule
     * @desc Deregisters a module.
     * @param {string} id
     * @returns {DiscordListener}
     */
    override deregisterModule(id: string): DiscordListener {
        const module = super.deregisterModule(id) as DiscordListener;
        if (!module) throw new Error(`Module ${id} is not registered.`)
        this.options.client.off(module.event, module.boundExecute);
        return module;
    }

    /**
     * @name registerModule
     * @param {string} modulePath 
     * @param {BaseHandler} handler 
     * @returns 
     */
    override async registerModule(modulePath: string, handler: BaseHandler = this): Promise<DiscordListener> {
        const module = await super.registerModule(modulePath, handler) as DiscordListener;
        if (!module.boundExecute) {
            module.boundExecute = module.execute.bind(module, this.options.client);
            if (module.options.once) {
                this.options.client.once(module.event, module.boundExecute);
            } else this.options.client.on(module.event, module.boundExecute);
        }
        return module;
    }
}

/** Types */

export interface DiscordListenerHandlerOptions extends BaseHandlerOptions {
    client: Client;
}