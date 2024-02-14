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

    get owner() {
        return this.data.owner;
    }

    get target() {
        return this.data.target;
    }

    get notes() {
        return this.data.notes;
    }

    get description() {
        return this.data.description;
    }
}

/** Types */
const UserSchema = z.object({
    type: z.literal("user"),
    _id: z.string(),
});

// Define a schema for when the type is "actor"
const ActorSchema = z.object({
    type: z.literal("actor"),
    _id: z.instanceof(ObjectId),
});

export const RelationshipEntityUInterface = z.union([UserSchema, ActorSchema]);
export type RelationshipEntityType = z.infer<typeof RelationshipEntityUInterface>;

export const RelationshipType = BaseDataInterface.extend({
    owner: RelationshipEntityUInterface,
    target: RelationshipEntityUInterface,
    notes: z.string(),
    description: z.string(),
})

export type RelationshipType = z.infer<typeof RelationshipType>;