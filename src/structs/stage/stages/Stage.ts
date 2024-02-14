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

	public async handleMessage(
		message: Message,
		actorsCalled: string[]
	): Promise<void> {
		if (actorsCalled.length > 0) {
			
		}
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
	 * @description Adds the relationships of actor to user/actor on stage.
	 * @param entity
	 * @returns {Promise<void>}
	 */
	public async addActorMemories(entity: ActorOnStageClass): Promise<void> {
		try {
			for (const [id, cursorEntity] of this._participants) {
				const type =
					cursorEntity instanceof ActorOnStageClass ? "actor" : "user";
				// skip if the cursorEntity is the same as the entity
				if (cursorEntity.id.toString() === entity.id.toString()) continue;
				// get relation from us to cursorEntity
				const ourRel = await RelationshipsCol.findOne({
					owner: { _id: entity.id, type: "actor" },
					target: { _id: cursorEntity.id, type: type },
				});

				// set it if it exists
				if (ourRel)
					entity.relationships.set(
						cursorEntity.id.toString(),
						new RelationshipClass(ourRel)
					);

				// if the cursorEntity type is actor, get the relation from cursorEntity to us
				if (cursorEntity instanceof ActorOnStageClass) {
					const theirRel = await RelationshipsCol.findOne({
						owner: { _id: cursorEntity.id, type: "actor" },
						target: { _id: entity.id, type: "actor" },
					});
					if (theirRel)
						cursorEntity.relationships.set(
							entity.id.toString(),
							new RelationshipClass(theirRel)
						);
				}
			}
		} catch (e) {
			winston.log("fatal", e);
			throw e;
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
