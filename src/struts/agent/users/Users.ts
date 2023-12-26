// author = shokkunn

import { Users } from "@prisma/client";
import AbstractDataClass from "../../base/BaseDataClass";
import { prisma } from "../../../utils/Database";
import winston from "winston";

export class UsersClass extends AbstractDataClass {
    private _name: string;
    private _blacklisted: boolean;

    constructor(data: Users) {
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

    async update(data: Partial<Users>) {
        return await prisma.users.update({
            where: {
                id: this.id
            },
            data
        });

    }
}