// author = shokkunn

import { EventEmitter } from "events";
import BaseModule from "./BaseMod";
import { loadFilesFromDirectory } from "../../utils/path/AssetsMan";
import path from "path";
import winston from "winston";
import { Collection } from "discord.js";
export default class BaseHandlerClass extends EventEmitter {
	protected _options: BaseHandlerOptions;
  protected _modules: Collection<string, BaseModule> = new Collection();
  
	constructor(options: BaseHandlerOptions) {
		super();
		options.extensions ??= [".ts", ".js"];
		this._options = options;
	}

	get modules() {
		return this._modules;
	}

	get options() {
		return this._options;
	}

	/**
	 * @name registerModule
	 * @desc Registers a module.
	 * @param {string} modulePath
	 * @param {BaseHandlerClass} handler
	 * @returns {BaseModule}
	 */
	public async registerModule(
		modulePath: string,
		handler: BaseHandlerClass = this
	): Promise<BaseModule> {
		let module;
		try {
			const importedModule = await import(path.resolve(modulePath));
			module = importedModule.default
				? new importedModule.default()
				: new importedModule();
			module.handler = handler;
			module.filePath = modulePath;
			this.emit("load", module);

			// Check if the module is already loaded
			if (this._modules.has(module.id)) {
				throw new Error(`Module ${module.id} is already loaded.`);
			} else this._modules.set(module.id, module);
		} catch (error) {
			winston.error(`Error loading module ${modulePath}:`, error);
			throw error;
		}
		return module as BaseModule;
	}

	/**
	 * @name deregisterModule
	 * @desc Deregisters a module.
	 * @param {string} id
	 * @returns {BaseModule | undefined}
	 */
	public deregisterModule(id: string): BaseModule | undefined {
		let module;
		try {
			module = this._modules.get(id);
			if (!module) throw new Error(`Module ${id} is not loaded.`);
			this.emit("unload", module);
			this._modules.delete(id);
			delete require.cache[require.resolve(path.resolve(module.filePath!))];
		} catch (error) {
			winston.error(`Error unloading module ${id}:`, error);
			throw error;
		}
		return module;
	}

	/**
	 * @name reloadModule
	 * @desc Reloads a module.
	 * @param {string} id
	 * @returns {BaseModule | undefined}
	 */
	public async reloadModule(id: string): Promise<BaseModule | undefined> {
		const module = this._modules.get(id);
		if (module) {
			this.emit("reload", module);
			this.deregisterModule(id);
			await this.registerModule(module.filePath!);
		}
		return module;
	}

	/**
	 * @name registerAllModules
	 * @desc Registers all modules in a directory.
	 * @param {string} directory
	 * @param {BaseHandlerClass} handler
	 * @returns {Map<string, BaseModule>}
	 */
	public async registerAllModules(
		directory: string = this.options.directory,
		handler: BaseHandlerClass = this
	): Promise<Map<string, BaseModule>> {
		await loadFilesFromDirectory(
			directory,
			async (filePath: string) => {
				await this.registerModule(filePath, handler);
			},
			(file: string) => {
				return this.options.extensions?.some((ext) => file.endsWith(ext));
			}
		);
		return this.modules;
	}

	/**
	 * @name deregisterAllModules
	 * @desc Deregisters all modules.
	 * @returns {Map<string, BaseModule>}
	 */
	public deregisterAllModules(): Map<string, BaseModule> {
		for (const module of this.modules.values()) {
			this.deregisterModule(module.id);
		}
		return this.modules;
	}
}

/** Types */

export interface BaseHandlerOptions {
	directory: string;
	extensions?: string[];
}
