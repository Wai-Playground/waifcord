import { z } from "zod";
import BaseDataClass, { BaseDataInterface } from "../../base/BaseData";

export default class UserClass extends BaseDataClass {
    declare data: UserType;
    constructor(data: UserType) {
        super(data);
    }

    isBlacklisted() {
        return this.data.blacklisted;
    }

    lastMessageSent() {
        return this.data.last_message;
    }
}

/** Types */

const UserInterface = BaseDataInterface.extend({
    username: z.string(),
    blacklisted: z.boolean().default(false),
    messages_sent: z.number().default(0),
    last_message: z.string().optional(),
});

export type UserType = z.infer<typeof UserInterface>;