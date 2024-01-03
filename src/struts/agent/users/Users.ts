// author = shokkunn

import AbstractDataClass from "../../base/BaseDataClass";
import winston from "winston";

export class UsersClass extends AbstractDataClass {
    private _name: string;
    private _blacklisted: boolean;

    constructor(data) {
        super(data);
        this._name = data.name;
        this._blacklisted = data.blacklisted;
    }

    get name() {
        return this._name
    }

    get blacklisted() {
        return this._blacklisted;
    }
}