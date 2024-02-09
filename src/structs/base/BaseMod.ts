// author = shokkunn

import BaseHandler from "./BaseModHandler";

export default class BaseModuleClass {
    private _id: string;
    public handler: BaseHandler | null = null;
    public filePath: string | null = null;
    constructor(id: string) {
        this._id = id;
    }

    get id() {
        return this._id;
    }

    async reload() {
        return await this.handler?.reloadModule(this.id);
    }

    deregister() {
        return this.handler?.deregisterModule(this.id);
    }

    async register() {
        return await this.handler?.registerModule(this.filePath!);
    }
}