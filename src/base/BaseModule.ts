// author = shokkunn

import BaseHandler from "./BaseHandler";

export default class BaseModule {
    private _id: string;
    public baseHandler: BaseHandler | null = null;
    public filePath: string | null = null;
    constructor(id: string) {
        this._id = id;
    }

    get id() {
        return this._id;
    }

    async reload() {
        return await this.baseHandler?.reloadModule(this.id);
    }

    deregister() {
        return this.baseHandler?.deregisterModule(this.id);
    }

    async register() {
        return await this.baseHandler?.registerModule(this.filePath!);
    }
}