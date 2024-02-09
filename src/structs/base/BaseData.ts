// author = shokkunn

import { z } from "zod";

export default class BaseDataClass {
    private _id: string;

    constructor(data: z.infer<typeof BaseDataInterface>) {
        this._id = data._id;
    }

    get id() {
        return this._id;
    }
}

/** Types */

export const BaseDataInterface = z.object({_id: z.string()});
