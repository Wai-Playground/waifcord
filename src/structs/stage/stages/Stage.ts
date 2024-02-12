// author = shokkunn

import { Collection, User } from "discord.js";
import ActorOnStageClass from "../actors/ActorOnStage";
import RelationshipClass, { RelationshipType } from "../relationships/Model";
import { RelationshipsCol } from "../../../utils/services/Mango";
import { ObjectId, WithId } from "mongodb";
import BaseDataClass from "../../base/BaseData";

export default class StageClass extends BaseDataClass {

	private _participants: Collection<string, ActorOnStageClass | User> =
		new Collection();

	constructor() {
		super({ _id: new ObjectId() });
	}

	get participants() {
		return this._participants;
	}

	/**
	 * @name addEntity
	 * @description Adds an entity to the stage.
	 * @param {ActorOnStageClass | User} entity
	 * @returns {Promise<void>}
	 */
	public async addEntity(entity: ActorOnStageClass | User): Promise<void> {
		this._participants.set(entity.id.toString(), entity);
		await this.addEntityMemories(entity);
	}

    /**
     * @name addEntityMemories
     * @description Adds the memories of the entity to the stage as well as update the memories of the other entities.
     * @todo Cache the relationships of the entities && use findMany to avoid unnecessary database calls.
     * @param {ActorOnStageClass | User} entity 
     * @returns {Promise<void>}
     */
	public async addEntityMemories(entity: ActorOnStageClass | User): Promise<void> {
        // first, if the entity is an actor, we need to set it with all 
        // the relationships it has with other entities
        let actorsOnStage = this._participants.filter(
            (actor) => actor instanceof ActorOnStageClass
        ) as Collection<string, ActorOnStageClass>;

        if (entity instanceof ActorOnStageClass) {
            // we find all the relationships that the actor has with the other actors
            let rels = await RelationshipsCol.find({
                owner: {
                    type: "actor",
                    _id: entity.id
                },
                target: {
                    _id: {
                        $in: Array.from(this._participants.keys())
                    }
                }
            }).toArray();
            // we then set the actor with the relationships, if they don't exist
            // we create them.
            for (const [id, actor] of actorsOnStage) {
                if (actor.id === entity.id) continue;
                let rel = rels.find((rel) => rel.target._id === id);
                if (!rel) {
                    rel = {
                        _id: new ObjectId(),
                        owner: {
                            type: "actor",
                            _id: entity.id
                        },
                        target: {
                            type: "actor",
                            _id: id
                        }
                    }
                    await RelationshipsCol.insertOne(rel);
                }
                entity.relationships.set(actor.id.toString(), new RelationshipClass(rel));
            }
        } 
        // next, every actor on stage needs to be updated with their relationship with 
        // the new entity

        for (const [id, actor] of actorsOnStage) {
            if (actor.id === entity.id) continue;
            let rel = await RelationshipsCol.findOne({
                owner: {
                    type: "actor",
                    _id: actor.id
                },
                target: {
                    type: entity instanceof User ? "user" : "actor",
                    _id: entity.id
                }
            });
            if (!rel) {
                rel = {
                    _id: new ObjectId(),
                    owner: {
                        type: "actor",
                        _id: actor.id
                    },
                    target: {
                        type: entity instanceof User ? "user" : "actor",
                        _id: entity.id
                    }
                }
                await RelationshipsCol.insertOne(rel);
            }
            actor.relationships.set(entity.id.toString(), new RelationshipClass(rel));
        }        
	}
}

/** Types */

export interface StageEvents {
	stageUserJoin: [user: User];
	stageUserLeave: [user: User];
	stageActorJoin: [actor: ActorOnStageClass];
	stageActorLeave: [actor: ActorOnStageClass];
	stageEnd: [stage: StageClass];
	stageCreate: [stage: StageClass];
	stageMessageCreate: [message: string];
}
