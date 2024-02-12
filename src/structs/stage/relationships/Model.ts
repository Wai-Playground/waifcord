// author = shokkunn

import { z } from "zod";
import BaseDataClass, { BaseDataInterface } from "../../base/BaseData";
import { RelationshipsCol } from "../../../utils/services/Mango";
import { ObjectId } from "mongodb";

export default class RelationshipClass extends BaseDataClass {
    declare data: RelationshipType;
    constructor(relationship: RelationshipType) {
        super(relationship)
    }
}

/** Types */

export const RelationshipEntityInterface = z.object({
    type: z.enum(["user", "actor"]),
    _id: z.string().or(z.instanceof(ObjectId))
})

export const RelationshipType = BaseDataInterface.extend({
    owner: RelationshipEntityInterface,
    target: RelationshipEntityInterface,
    notes: z.string().optional(),
    description: z.string().optional(),
})

export type RelationshipType = z.infer<typeof RelationshipType>;