// author = shokkunn

import BaseHandler from "./BaseHandler";

export default class BaseModule {
    private _id: string;
    public handler: BaseHandler | null = null;
    public filePath: string | null = null;
    constructor(id: string) {
        this._id = id;
    }

    get id() {
        return this._id;
    }

    reload() {
        return this.handler?.reloadModule(this.id);
    }
}