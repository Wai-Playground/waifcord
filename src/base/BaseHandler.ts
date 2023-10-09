// author = shokkunn

import { EventEmitter } from "events";
import BaseModule from "./BaseModule";
import { loadFilesFromDirectory } from "../utils/Path";

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

    public async registerModule(path: string) {
        let instance = await import(path);
        instance = instance.default ? new instance.default() : instance = new instance();
        instance.handler = this;
        instance.filePath = path;
        this.emit("load", instance);
        // check if the module is already loaded
        if (this._modules.has(instance.id))
            this._modules.get(instance.id)?.reload();
        else this._modules.set(instance.id, instance);
    }

    public deregisterModule(id: string) {
        const module = this._modules.get(id);
        if (module) {
            this.emit("unload", module);
            this._modules.delete(id);
        }
    }

    public async reloadModule(id: string): Promise<BaseHandler> {
        const module = this._modules.get(id);
        if (module) {
            this.emit("reload", module);
            this.deregisterModule(id);
            await this.registerModule(module.filePath!);
        }
        return this;
    }

    public async loadAllModules(directory: string = this.options.directory) {
        await loadFilesFromDirectory(directory, async (file: string) => {
            await this.registerModule(file);
        }, (file: string) => {
            return this.options.extensions?.some((ext) => file.endsWith(ext));
        });
    }
}

/** Types */

export interface BaseHandlerOptions {
    directory: string;
    extensions?: string[];
}