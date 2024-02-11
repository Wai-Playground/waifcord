import { Client, ClientEvents } from "discord.js";
import BaseModuleClass from "../../base/BaseMod";
import { StageEvents } from "../../stage/stages/Stage";
import ListenerHandlerClass from "./EventHandler";
import CustomClient from "../client/Client";

export default abstract class DiscordListenerClass extends BaseModuleClass {
    declare protected _options: DiscordListenerOptions;
    declare public handler: ListenerHandlerClass | null;
    declare public client: CustomClient;
    
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
        throw new Error("Method not implemented.");
    }
}

/** Types */

interface DiscordListenerOptions {
    event: FullEventsMixin
    once?: boolean;
}

export type FullEventsMixin = keyof ClientEvents | StageEvents;