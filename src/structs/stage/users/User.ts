import { z } from "zod";
import BaseDataClass, { BaseDataInterface } from "../../base/BaseData";

export default class UserClass extends BaseDataClass {

}

/** Types */

const UserInterface = BaseDataInterface.extend({
    username: z.string(),
    blacklisted: z.boolean().default(false),
    messages_sent: z.number().default(0),
    last_message: z.string().optional(),
});

export type User = z.infer<typeof UserInterface>;