// author = shokkunn

import { Client, ClientOptions } from "discord.js";
import InteractionHandlerClass from "../interactions/InteractHandler";

export default class CustomClient extends Client {
    private _listenerHandler: any | null = null;
    private _interactionHandler: InteractionHandlerClass | null = null;
    private _toolHandler: any | null = null;

    constructor(options: ClientOptions) {
        super(options);
    }

    public async start(token: string) {
        await this.login(token);
    }
}