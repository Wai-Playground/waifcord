// author = shokkunn

import { ObjectId } from "mongodb";
import { z } from "zod";

export default abstract class BaseDataClass {
    public data: z.infer<typeof BaseDataInterface>;

    constructor(data: z.infer<typeof BaseDataInterface>) {
        this.data = data;
    }

    get id() {
        return this.data._id;
    }

    get createdAt() {
        return this.data._id.getTimestamp();
    }
}

/** Types */

export const BaseDataInterface = z.object({_id: (z.instanceof(ObjectId))});

