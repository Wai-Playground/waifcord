// author = shokkunn

import { z } from "zod";
import BaseDataClass, { BaseDataInterface } from "../../base/BaseData";
import { RelationshipsCol } from "../../../utils/services/Mango";

export default class RelationshipClass extends BaseDataClass {
    declare data: RelationshipType;
    constructor(relationship: RelationshipType) {
        super(relationship)
    }

    static async fetchRelationships(idsToFind: string[], currentId: string) {
        // Fetch relationship from database
        const rel = await RelationshipsCol.find({
            owner: {
                _id: currentId,
            },
            target: {
                _id: { $in: idsToFind }
            }
        }).toArray();
        
        return rel;
    }
}

/** Types */

export const RelationshipEntityInterface = z.object({
    type: z.enum(["user", "actor"]),
    _id: z.string()
})

export const RelationshipType = BaseDataInterface.extend({
    owner: RelationshipEntityInterface,
    target: RelationshipEntityInterface,
    notes: z.string().optional(),
    description: z.string().optional(),
})

export type RelationshipType = z.infer<typeof RelationshipType>;