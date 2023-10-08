// author = shokkunn

import { EventEmitter } from "events";
import BaseModule from "./BaseModule";
import { loadFilesFromDirectory } from "../utils/Path";

export default class BaseHandler extends EventEmitter {
    private _options: BaseHandlerOptions;
    private _modules: Map<string, BaseModule> = new Map();
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

    registerModule(instance: any, path: string) {
        this.emit("load", instance);
        instance.handler = this;
        instance.filePath = path;
        // check if the module is already loaded
        if (this._modules.has(instance.id)) {
            this._modules.get(instance.id)?.reload();
        } else {
            this._modules.set(instance.id, instance);
        }
    }

    deregisterModule(id: string) {
        const module = this._modules.get(id);
        if (module) {
            this.emit("unload", module);
            this._modules.delete(id);
        }
    }

    reloadModule(id: string): BaseHandler {
        const module = this._modules.get(id);
        if (module) {
            this.emit("reload", module);
            this.deregisterModule(id);
            this.registerModule(module, module.filePath!);
        }
        return this;
    }

    async loadAllModules(directory: string = this.options.directory) {
        await loadFilesFromDirectory(directory, async (file: string) => {
            let instance = await import(file);
            if (instance.default) instance = instance.default;
            this.registerModule(new instance(), file);
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