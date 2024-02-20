// author = shokkunn

import { ChannelType, Collection, Message, User } from "discord.js";
import ActorOnStageClass from "../actors/ActorOnStage";
import RelationshipClass, { RelationshipType } from "../relationships/Model";
import { RelationshipsCol, StagesCol } from "../../../utils/services/Mango";
import { ObjectId, WithId } from "mongodb";
import BaseDataClass from "../../base/BaseData";
import winston from "winston";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { ActorStageMessageClass, BaseStageMessageClass, UserStageMessageClass } from "./Messages";
import { DefaultStageMessageBufferLimit, DefaultStageMessageBufferTimeMS } from "../../../utils/Constants";

export default class StageClass extends BaseDataClass {
	private _participants: Collection<string, ActorOnStageClass | User> =
		new Collection();
	private _messageBuffer: Message[] = [];
	private _bufferTimeout: Timer | null = null;
	
	public defaultBufferLength: number = DefaultStageMessageBufferLimit;
	public defaultBufferTime: number = DefaultStageMessageBufferTimeMS;
	public summary: string = "";

	private _lastWent: string | null = null;

	constructor() {
		super({ _id: new ObjectId() });
	}

	get participants() {
		return this._participants;
	}

	get actorParticipants() {
		return this._participants.filter(
			(actor) => actor instanceof ActorOnStageClass
		) as Collection<string, ActorOnStageClass>;
	}

	get actorsWithTurns() {
		return this.actorParticipants.filter((actor) => actor.turnsLeft > 0);
	}

	findActorToRespond() {
		// if there is a priority actor, return that
		const priorityActor = this.actorsWithTurns.find((actor) => actor.priorityCalled);
		if (priorityActor) return priorityActor;
		// find all actors that are not the last message author && has more than one turn
		const validActors = this.actorsWithTurns.filter((actor) => 
			actor.isGenerating === false &&
			actor.id.toString() !== this._lastWent) as Collection<string, ActorOnStageClass>;
		return validActors.sort((a, b) => b.turnsLeft - a.turnsLeft).first();
	}

	insertIntoActorMessages(BaseMessageClass: BaseStageMessageClass) {
		for (const [id, actor] of this.actorParticipants) {
			actor.messages.push(BaseMessageClass);
		}
	}

	async sendBuffer() {
		// insert the buffer to the messages
		for (const messages of this._messageBuffer) {
			this.insertIntoActorMessages(new UserStageMessageClass(messages, messages.author));
			this._lastWent = messages.author.id.toString();
		}
		// go through the actors turn by turn
		for (let _ = 0; _ < this.actorsWithTurns.size; _++) {
			const actor = this.findActorToRespond();
			console.log(actor?.actorClass.name)
			// if no actor is found, break
			if (!actor) break;

			actor.turnsLeft--;
			actor.priorityCalled = false;

			let webhookMsg = await actor.handleMessage();
			this.insertIntoActorMessages(new ActorStageMessageClass(webhookMsg, actor));
			this._lastWent = actor.id.toString();
			
			console.log(actor.actorClass.name + " has " + actor.turnsLeft + " turns left");
		}
		// reset the buffer
		this._messageBuffer = [];
	}

	/**
	 * What this does:
	 * 1. Adds the message to the buffer
	 * 2. If the buffer is full or the time is up, send the buffer
	 * 3. The buffer function will insert the buffer to the messages (users), go through the 
	 * actors turn by turn (their outputs will also be added to the messages), and reset the buffer.
	 */
	public async handleMessage(
		message: Message,
		actorsCalled: string[]
	): Promise<void> {
		if (actorsCalled.length > 0) {
			// for every actor called, add a turn to them.
			for (const actorId of actorsCalled) {
				const actor = this._participants.get(actorId);
				if (actor instanceof ActorOnStageClass) {
					actor.turnsLeft++;
					actor.priorityCalled = true;
				}
			}
		}

		this._messageBuffer.push(message);

		// if the buffer is full, send the buffer
		// if there is buffer, reset the buffer time
		if (this._bufferTimeout) clearTimeout(this._bufferTimeout);
		
		if (this._messageBuffer.length >= this.defaultBufferLength) return await this.sendBuffer(); else {
			this._bufferTimeout = setTimeout(async () => await this.sendBuffer(), this.defaultBufferTime);
		}

		console.log(this._messageBuffer.length);
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
		// for every actor, add the relationship from the actor to the user
		try {
			for (const [id, actor] of this.actorParticipants) {
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
