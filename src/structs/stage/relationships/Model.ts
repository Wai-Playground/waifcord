// author = shokkunn

import { z } from "zod";
import { BaseDataInterface } from "../../base/BaseData";

/** Types */

const RelationshipEntityInterface = z.object({
    type: z.enum(["user", "actor"]),
    _id: z.string()
})

BaseDataInterface.extend({
    owner: RelationshipEntityInterface,
    target: RelationshipEntityInterface,
    notes: z.string().optional(),
    description: z.string().optional(),
})