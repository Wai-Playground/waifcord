// author = shokkunn

import { Collection, User, Webhook } from "discord.js";
import StageClass from "../stages/Stage";
import ActorClass, { ActorType } from "./Actor";
import { RelationshipsCol } from "../../../utils/services/Mango";
import RelationshipClass from "../relationships/Model";
import OpenAI from "openai";
import OpenAIClient from "../../../utils/services/CloseAI";
import {
	ChatCompletionMessage,
	ChatCompletionMessageParam,
} from "openai/resources/index.mjs";

export default class ActorOnStageClass {
	private _actorClass: ActorClass;

	public stage: StageClass;
	public webhook: Webhook;
	public relationships: Collection<string, RelationshipClass> =
		new Collection();

	public messages: ChatCompletionMessage[] = [];

	constructor(data: ActorType, stageClass: StageClass, webhook: Webhook) {
		this._actorClass = new ActorClass(data);
		this.stage = stageClass;
		this.webhook = webhook;
	}

	get id() {
		return this._actorClass.id;
	}

	get actorClass() {
		return this._actorClass;
	}

	formatRelationships() {
		let ret: string = "";
		try {
			for (const [id, relations] of this.relationships.filter(
				(rel) => rel.owner._id == this.id.toString()
			)) {
				const target = this.stage.participants.get(
					relations.target._id.toString()
				);
				if (!target)
					throw new Error(
						"Target ID not found while formatting relationships: " +
							relations.target._id.toString()
					);

				if (target instanceof User) {
					ret += `- ${target.username} (id: ${id}): ${relations.description}\n`;
				} else if (target instanceof ActorOnStageClass) {
					ret += `- ${target.actorClass.name}: ${relations.description}\n`;
				}

				ret += "\n Notes: " + relations.notes + "\n";
			}
			if (ret.length == 0) return "No relationships found!";
		} catch (error) {
			throw error;
		}
	}

	public formatSystemMessages(): ChatCompletionMessageParam[] {
		return [
			{
				role: "system",
				content:
					"# INSTRUCTION: Roleplay with everybody, keep the conversation interesting. You will be given what you think of the persons based on your previous interactions.\n" +
					"## Rules:\n" +
					`- DO NOT reply with a prefix. EXAMPLE: "${this._actorClass.name}: Hello!"\n` +
					"- DO NOT deviate from the your personality & traits given below. Follow the INSTRUCTION.\n" +
					"## Optional:\n" +
					'- You may wrap monologues or thoughts in asterisks. EXAMPLE: "*I wonder what they think of me...*"\n' +
					"- When you want to get a faster response from a agent, you can address them. EXAMPLE: " +
					'"Hey Suzu, what do you think?"\n',
			},
			{
				role: "system",
				content:
					"# You are: " +
					this._actorClass.name +
					"\n# Description: " +
					this._actorClass.personalityPrompt,
			},
			{
				role: "system",
				content:
					"## People in the chat: " +
					this.stage.participants
						.filter((p) => p.id.toString() == this.id.toString())
						.map((p) => (p instanceof User ? p.username : p.actorClass.name))
						.join(", ") +
					"\n# Relationships, what I think of...\n" +
					this.formatRelationships(),
			},
		];
	}

	private async _getCompletions(messages: ChatCompletionMessageParam[]) {
		return await OpenAIClient.chat.completions.create({
			...this._actorClass.modelParams,
			messages: messages,
		});
	}
}
