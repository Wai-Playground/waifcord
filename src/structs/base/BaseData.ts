// author = shokkunn

import { Collection, Filter, FindOptions, ObjectId } from "mongodb";
import { z } from "zod";

export default abstract class BaseDataClass {
    private _data: z.infer<typeof BaseDataInterface>;

    constructor(data: z.infer<typeof BaseDataInterface>) {
        this._data = data;
    }

    get id() {
        return this._data._id;
    }

    get createdAt() {
        return this._data._id.getTimestamp();
    }
}

/** Types */

export const BaseDataInterface = z.object({_id: (z.instanceof(ObjectId))});

