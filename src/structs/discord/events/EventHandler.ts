// author = shokkunn

import { ClientEvents, Collection } from "discord.js";
import CustomClient from "../client/Client";
import winston from "winston";
import BaseHandlerClass, {
	BaseHandlerOptions,
} from "../../base/BaseModHandler";
import DiscordListenerClass from "./Listener";

export default class ListenerHandlerClass extends BaseHandlerClass {
	protected declare _options: DiscordListenerHandlerOptions;
	protected declare _modules: Collection<string, DiscordListenerClass>;

	constructor(options: DiscordListenerHandlerOptions) {
		super(options);
	}

	override get modules(): Collection<string, DiscordListenerClass> {
		return this._modules;
	}

	override get options(): DiscordListenerHandlerOptions {
		return this._options;
	}

	/**
	 * @name deregisterModule
	 * @desc Deregisters a module.
	 * @param {string} id
	 * @returns {DiscordListenerClass}
	 */
	override deregisterModule(id: string): DiscordListenerClass {
		const module = super.deregisterModule(id) as DiscordListenerClass;
		if (!module) throw new Error(`Module ${id} not found`);
		this.options.client.off(
			module.event as keyof ClientEvents,
			module.execute as (...args: any[]) => void
		);
		return module;
	}

	/**
	 * @name registerModule
	 * @param {string} modulePath
	 * @param {BaseHandler} handler
	 * @returns
	 */
	override async registerModule(
		modulePath: string,
		handler: BaseHandlerClass = this
	): Promise<DiscordListenerClass> {
		const module = (await super.registerModule(
			modulePath,
			handler
		)) as DiscordListenerClass;
		if (!module) throw new Error(`Module ${modulePath} not found`);
		if (!module.boundExecute) {
			module.boundExecute = module.execute.bind(module, this.options.client);
			try {
				if (module.options.once) {
					this.options.client.once(
						module.event as keyof ClientEvents,
						module.boundExecute
					);
				} else
					this.options.client.on(
						module.event as keyof ClientEvents,
						module.boundExecute
					);
			} catch (error) {
				throw error;
			}
		}
		return module;
	}
}

/** Types */

export interface DiscordListenerHandlerOptions extends BaseHandlerOptions {
	client: CustomClient;
}
