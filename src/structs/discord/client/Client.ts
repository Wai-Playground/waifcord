// author = shokkunn

import { Client, ClientOptions } from "discord.js";
import InteractionHandlerClass from "../interactions/InteractHandler";
import ListenerHandlerClass from "../events/EventHandler";
import { DefaultPaths } from "../../../utils/Constants";
import winston from "winston";

export default class CustomClient extends Client {
    private _listenerHandler: ListenerHandlerClass | null = null;
    private _interactionHandler: InteractionHandlerClass | null = null;
    private _toolHandler: any | null = null;

    constructor(options: ClientOptions) {
        super(options);
    }

	public getListenerHandler() {
		if (!this._listenerHandler) {
			throw new Error(
				"Listener handler not initialized."
			);
		}
		return this._listenerHandler;
	}

	public getToolHandler() {
		if (!this._toolHandler) {
			throw new Error(
				"Tool handler not initialized."
			);
		}
		return this._toolHandler;
	}

	public getInteractionHandler() {
		if (!this._interactionHandler) {
			throw new Error(
				"Interaction handler not initialized."
			);
		}
		return this._interactionHandler;
	}

	async initInteractions() {
		try {
			this._interactionHandler = new InteractionHandlerClass(this, {
                directory: DefaultPaths.interactionsPath
            });

			await this._interactionHandler.registerAllModules();
		} catch (error) {
			throw error;
		}
	}

	async initListeners() {
		try {
			this._listenerHandler = new ListenerHandlerClass({
				client: this,
				directory: DefaultPaths.listenersPath,
			});

			await this._listenerHandler.registerAllModules();
		} catch (error) {
			throw error;
		}
	}

	async initTools() {
		try {
			if (this._toolHandler) {
				return this._toolHandler;
			}



			await this._toolHandler.registerAllModules();
			return this._toolHandler;
		} catch (error) {
			throw error;
		}
	}

	async setup() {
		try {
			await this.initListeners();
			await this.initInteractions();
			//await this.initTools();
		} catch (error) {
            winston.log("fatal", "Error setting up client:", error);
			throw error;
		}
	}

    public async start(token: string) {
        await this.login(token);
    }
}