// author = shokkunn

import { Collection, Filter, FindOptions, ObjectId } from "mongodb";
import { z } from "zod";

export default class BaseDataClass {
    private _id: ObjectId

    constructor(data: z.infer<typeof BaseDataInterface>) {
        this._id = data._id;
    }

    get id() {
        return this._id;
    }

    get createdAt() {
        return this._id.getTimestamp();
    }
}

/** Types */

export const BaseDataInterface = z.object({_id: (z.instanceof(ObjectId))});

