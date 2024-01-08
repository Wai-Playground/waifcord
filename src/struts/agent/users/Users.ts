// author = shokkunn

import { Prisma, Users } from "@prisma/client";
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

    /** Database Management */

    static async updateUser(id: string, data: Partial<Users>) {
        return await prisma.users.update({
            where: {
                id: id
            },
            data
        });
    }

    static async createUser(data: Prisma.UsersCreateArgs) {
        try {
            let res = await prisma.users.create(data);
            return new UsersClass(res);
        } catch (e) {
            winston.error(e);
            throw e;
        }
    }

    static async getUserById(id: string): Promise<UsersClass | undefined> {
        try {
            let user = await prisma.users.findUnique({
                where: {
                    id
                }
            });
            if (!user) return undefined;
            return new UsersClass(user);
        } catch (e) {
            winston.error(e);
            return undefined;
        }
    }
}