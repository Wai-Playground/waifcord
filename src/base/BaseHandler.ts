// author = shokkunn

import { EventEmitter } from "events";
import BaseModule from "./BaseModule";
import { loadFilesFromDirectory } from "../utils/Path";
import path from "path";
export default class BaseHandler extends EventEmitter {
    protected _options: BaseHandlerOptions;
    protected _modules: Map<string, BaseModule> = new Map();

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

    public async registerModule(modulePath: string, handler: BaseHandler = this) {
        let module;
        try {
            const importedModule = await import(path.resolve(modulePath));
            module = importedModule.default ? new importedModule.default() : new importedModule()
            module.handler = handler;
            module.filePath = modulePath;
            this.emit("load", module);

            // Check if the module is already loaded
            if (this._modules.has(module.id)) {
                this._modules.get(module.id)?.reload();
            } else {
                this._modules.set(module.id, module);
            }
        } catch (error) {
            this.emit("error", error);
        }
        return module as BaseModule;
    }

    public deregisterModule(id: string) {
        const module = this._modules.get(id);
        if (module) {
            this.emit("unload", module);
            this._modules.delete(id);
            delete require.cache[require.resolve(path.resolve(module.filePath!))];
        }
        return module;
    }

    public async reloadModule(id: string): Promise<BaseModule | undefined> {
        const module = this._modules.get(id);
        if (module) {
            this.emit("reload", module);
            this.deregisterModule(id);
            await this.registerModule(module.filePath!);
        }
        return module;
    }

    public async registerAllModules(directory: string = this.options.directory, handler: BaseHandler = this) {
        await loadFilesFromDirectory(directory, async (filePath: string) => {
            await this.registerModule(filePath, handler);
        }, (file: string) => {
            return this.options.extensions?.some((ext) => file.endsWith(ext));
        });
        return this.modules;
    }

    public deregisterAllModules() {
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