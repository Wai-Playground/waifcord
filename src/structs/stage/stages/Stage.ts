// author = shokkunn

import { Collection, Message, User } from "discord.js";
import ActorOnStageClass from "../actors/ActorOnStage";
import RelationshipClass from "../relationships/Model";
import { RelationshipsCol } from "../../../utils/services/Mango";
import { ObjectId } from "mongodb";
import BaseDataClass from "../../base/BaseData";
import winston from "winston";
import { ActorStageMessageClass, BaseStageMessageClass, ToolStageMessageClass, UserStageMessageClass } from "./Messages";
import { DefaultStageMessageBufferLimit, DefaultStageMessageBufferTimeMS, DefaultSummarizeWindow, DefaultSummarizationParams } from "../../../utils/Constants";
import OpenAIClient from "../../../utils/services/CloseAI";
//import ToolHandlerClass from "../tools/ToolHandler";

export default class StageClass extends BaseDataClass {
	private _participants: Collection<string, ActorOnStageClass | User> =
		new Collection();
	private _messageBuffer: Message[] = [];
	private _bufferTimeout: Timer | null = null;
	private _lastWent: string | null = null;
	private _isGenerating: boolean = false;
	//private _toolHandler: ToolHandlerClass;

	public defaultBufferLength: number = DefaultStageMessageBufferLimit;
	public defaultBufferTime: number = DefaultStageMessageBufferTimeMS;

	public messages: BaseStageMessageClass[] = [];

	public summary: string = "";
	public summaryWindow: number | undefined = DefaultSummarizeWindow;
	public summaryTokens: number = 0;

	constructor(/*toolHandler: ToolHandlerClass*/) {
		super({ _id: new ObjectId() });
		//this._toolHandler = toolHandler;
	}

	get participants() {
		return this._participants;
	}

	get isGenerating() {
		return this.actorParticipants.some((actor) => actor.isGenerating) || this._isGenerating;
	}

	/*

	get toolHandler() {
		return this._toolHandler;
	}
	*/

	get actorParticipants() {
		return this._participants.filter(
			(actor) => actor instanceof ActorOnStageClass
		) as Collection<string, ActorOnStageClass>;
	}

	get actorsWithTurns() {
		return this.actorParticipants.filter((actor) => actor.turnsLeft > 0);
	}

	formatMessagesForSummary() {
		let ret = "";
		for (const message of this.messages) {
			if (message.isUser()) {
				ret += (message as UserStageMessageClass).authorClass.username + ": " + message.message.content + "\n";
			} else if (message.isActor()) {
				ret += (message as ActorStageMessageClass).authorClass.actorClass.name + ": " + message.message.content + "\n";
			}
		}
		return ret;
	}

	/**@TODO chunk this */
	async generateSummary() {
		// check if the agents messages have more than the default DefaultSummarizeWindow.
		// if it does, summarize the last DefaultSummarizeWindow messages
		this._isGenerating = true;
		const summary = await OpenAIClient.chat.completions.create({
			...DefaultSummarizationParams,
			"messages": [
			{
				"content": "Incrementally summarize the following messages. You will be provided with the previous Summary, add on to it.\n" + 
				"It should be condense, with meaningful information but easy enough for an AI to understand the context. Only output the new summary, no prefixes.",
				"role": "system"
			}, 
			{
				"content": "Previous Summary: \"" + this.summary + "\"",
				"role": "system"
			},
			{
				"content": this.formatMessagesForSummary(),
				"role": "system"
			}],
		})
		
		this.summary = summary.choices[0].message.content || "";
		this.summaryTokens += summary.usage?.total_tokens || 0;
		// clear the messages except the most recent 
		this.messages = [this.messages[this.messages.length - 1]];
		this._isGenerating = false;
	}

	findActorToRespond() {
		// if there is a priority actor, return that
		const priorityActor = this.actorsWithTurns.find((actor) => actor.priorityCalled && actor.turnsLeft > 0);
		if (priorityActor) return priorityActor;
		// find all actors that are not the last message author && has more than one turn
		const validActors = this.actorsWithTurns.filter((actor) => 
			actor.isGenerating === false &&
			actor.id.toString() !== this._lastWent) as Collection<string, ActorOnStageClass>;
		return validActors.sort((a, b) => b.turnsLeft - a.turnsLeft).first();
	}

	async sendBuffer() {
		// insert the buffer to the messages
		for (const messages of this._messageBuffer) {
			this.messages.push(new UserStageMessageClass(messages, messages.author));
			this._lastWent = messages.author.id.toString();
		}
		// go through the actors turn by turn
		for (let _ = 0; _ < this.actorsWithTurns.size; _++) {
			const actor = this.findActorToRespond();
			// if no actor is found, break
			if (!actor) break;

			actor.turnsLeft--;
			actor.priorityCalled = false;

			let ret = await actor.handleMessage({
				full: this.messages,
				buffer: this._messageBuffer,
			}, this.summary.length > 0 ? this.summary : undefined);

			/**@todo Yeah, we gotta yk fix this mess */
			/*
			let ret = await actor.handleMessage(this.messages, this.summary);
			if (ret.rawCompletions.choices[0].message.content) {
				let calledActors = await StageRunnerClass.containsActiveWords(ret.rawCompletions.choices[0].message.content, await StageRunnerClass.getActiveWords());
				if (calledActors.length > 0) {
					for (const actorId of calledActors) {
						const actor = this._participants.get(actorId);
						if (actor instanceof ActorOnStageClass) {
							actor.priorityCalled = true;
						}
					}
				}
			}
			*/
			
			this.messages.push(new ActorStageMessageClass(ret.message, ret.rawCompletions.choices[0].message, actor));

			/** 
			@todo tool usge disabled for now
			if (ret.rawCompletions.choices[0].finish_reason === "tool_calls" && ret.tools.length > 0) {
				// if the completion is due to tool calls, execute the tools
				for (const result of ret.tools) {
					let test = new ToolStageMessageClass(ret.message, result, actor, this._messageBuffer)
					this.messages.push(test);
				}
				actor.turnsLeft++;
				this._messageBuffer = [];

				await this.sendBuffer()
				continue;
			}
			*/
			this._lastWent = actor.id.toString();
			// checks if conditions meet to generate a summary
			if (this.summaryWindow && this.messages.length >= this.summaryWindow) await this.generateSummary();
			
			console.log(actor.actorClass.name + " has " + actor.turnsLeft + " turns left");
		}
		// reset the buffer
		this._messageBuffer = [];
	}

	/**
	 * @name handleMessage
	 * @param {Message} message to be handled
	 * @param {Array<string>} actorsCalled actors that were called
	 * @returns {Promise<void>}
	 */
	public async handleMessage(
		message: Message,
		actorsCalled: string[]
	): Promise<void> {
		if (actorsCalled.length > 0) {
			// for every actor called, make them a priority.
			for (const actorId of actorsCalled) {
				const actor = this._participants.get(actorId);
				if (actor instanceof ActorOnStageClass) {
					actor.priorityCalled = true;
				}
			}
		}

		this.actorParticipants.forEach((actor) => actor.turnsLeft++);

		this._messageBuffer.push(message);

		// if the buffer is full, send the buffer
		// if there is buffer, reset the buffer time
		if (this._bufferTimeout) clearTimeout(this._bufferTimeout);
		
		if (this._messageBuffer.length >= this.defaultBufferLength) return await this.sendBuffer(); else {
			this._bufferTimeout = setTimeout(async () => await this.sendBuffer(), this.defaultBufferTime);
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
