import { z } from "zod";
import { BaseDataInterface } from "../../base/BaseData";

export default class UserClass {
    
}

/** Types */

const UserInterface = BaseDataInterface.extend({
    username: z.string(),
    blacklisted: z.boolean().default(false),
    
});

export type User = z.infer<typeof UserInterface>;