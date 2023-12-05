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

    override deregisterModule(id: string): DiscordListener {
        console.warn(`Deregistered listener ${id} from ${this.modules.get(id)?.event}`)
        const module = super.deregisterModule(id) as DiscordListener;
        if (!module) throw new Error(`Module ${id} is not registered.`)
        this.options.client.off(module.event, module.boundExecute);
        return module;
    }

    /*
    override async reloadModule(id: string): Promise<DiscordListener> {
        const module = await super.reloadModule(id) as DiscordListener;
        console.log(`Reloaded listener ${module.id} from ${module.event}`)
        this.options.client.off(module.event, module.boundExecute);
        this.deregisterModule(module.id);
        await this.registerModule(module.filePath!);
        return module;
    }*/

    override async registerModule(modulePath: string, handler: BaseHandler = this): Promise<DiscordListener> {
        const module = await super.registerModule(modulePath, handler) as DiscordListener;
        console.info(`Registered listener ${module.id} to ${module.event}`)
        if (!module.boundExecute) {
            module.boundExecute = module.execute.bind(module, this.options.client);
            if (module.options.once) {
                this.options.client.once(module.event, module.boundExecute);
            } else this.options.client.on(module.event, module.boundExecute);
        }
        return module;
    }
    
    /*
    override deregisterAllModules(): Map<string, DiscordListener> {
        const modules = super.deregisterAllModules() as Map<string, DiscordListener>;
        for (const module of modules.values()) this.deregisterModule(module.id);
        return modules;
    }*/
}

/** Types */

export interface DiscordListenerHandlerOptions extends BaseHandlerOptions {
    listeners?: DiscordListener[];
    client: Client;
}