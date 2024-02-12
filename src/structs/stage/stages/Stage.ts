// author = shokkunn

import { Collection, Message, User } from "discord.js";
import ActorOnStageClass from "../actors/ActorOnStage";
import RelationshipClass, { RelationshipType } from "../relationships/Model";
import { RelationshipsCol, StagesCol } from "../../../utils/services/Mango";
import { ObjectId, WithId } from "mongodb";
import BaseDataClass from "../../base/BaseData";
import winston from "winston";

export default class StageClass extends BaseDataClass {
	private _participants: Collection<string, ActorOnStageClass | User> =
		new Collection();
    
    private _messageBuffer: Collection<string, Message> = new Collection();

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
	public async addActor(entity: ActorOnStageClass): Promise<void> {
		this._participants.set(entity.id.toString(), entity);
		await this.addActorMemories(entity);
	}

    /**
     * @name addUser
     * @description Adds a user to the stage.
     * @param {User} entity 
     * @returns {Promise<void>}
     */
	public async addUser(entity: User): Promise<void> {
		this._participants.set(entity.id, entity);
		await this.addUserMemories(entity);
	}

    /**
     * @name addUserMemories
     * @description Adds the relationships from the actors to the user if they exist.
     * @param {User} entity 
     */
	public async addUserMemories(entity: User): Promise<void> {
        // get all actors on stage
        const actorsOnStage = this._participants.filter(
            (actor) => actor instanceof ActorOnStageClass
        ) as Collection<string, ActorOnStageClass>;

        // for every actor, add the relationship from the actor to the user
        try {
            for (const [id, actor] of actorsOnStage) {
                const rel = await RelationshipsCol.findOne({
                    owner: { _id: actor.id, type: "actor" },
                    target: { _id: entity.id, type: "user" },
                });

                if (rel) actor.relationships.set(entity.id, new RelationshipClass(rel));
            }
        } catch (e) {
            winston.log("fatal", e);
            throw e;
        }
    }

    /**
     * @name addActorMemories
     * @description Adds the relationships of actor to actors if they exist.
     * @param entity 
     * @returns {Promise<void>}
     */
	public async addActorMemories(entity: ActorOnStageClass): Promise<void> {
		// get all actors on stage
		const actorsOnStage = this._participants.filter(
			(actor) => actor instanceof ActorOnStageClass && actor.id !== entity.id
		) as Collection<string, ActorOnStageClass>;

		try {
			for (const [id, actor] of actorsOnStage) {
				// find the relationship from entity to actor
				const ownerRel = await RelationshipsCol.findOne({
					owner: { _id: entity.id, type: "actor" },
					target: { _id: actor.id, type: "actor" },
				});

				// find the relationship from actor to entity
				const targetRel = await RelationshipsCol.findOne({
					owner: { _id: actor.id, type: "actor" },
					target: { _id: entity.id, type: "actor" },
				});

				if (ownerRel)
					entity.relationships.set(
						actor.id.toString(),
						new RelationshipClass(ownerRel)
					);

				if (targetRel)
					actor.relationships.set(
						entity.id.toString(),
						new RelationshipClass(targetRel)
					);
			}
		} catch (e) {
			winston.log("fatal", e);
			throw e;
		}
	}

    public async handleMessage(message: Message, actorsCalled: string[]): Promise<void> {
        
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
