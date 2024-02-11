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
    relationship: z.string(),
    description: z.string().optional(),
})