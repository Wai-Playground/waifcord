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
import { DefaultActorTurns } from "../../../utils/Constants";
import { BaseStageMessageClass } from "../stages/Messages";

export default class ActorOnStageClass {
	private _actorClass: ActorClass;
	public isGenerating: boolean = false;

	public stage: StageClass;
	public webhook: Webhook;
	public relationships: Collection<string, RelationshipClass> =
		new Collection();

	private _turnsLeft: number = DefaultActorTurns;
	public priorityCalled: boolean = false;

	public messages: BaseStageMessageClass[] = [];

	constructor(data: ActorType, stageClass: StageClass, webhook: Webhook) {
		this._actorClass = new ActorClass(data);
		this.stage = stageClass;
		this.webhook = webhook;
	}

	get turnsLeft() {
		return this._turnsLeft;
	}

	set turnsLeft(value: number) {
		this._turnsLeft = value < 0 ? 0 : value;
	}

	get id() {
		return this._actorClass.id;
	}

	get actorClass() {
		return this._actorClass;
	}

	public formatRelationships() {
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
			// base instructions
			{
				role: "system",
				content:
					"# INSTRUCTION: Roleplay with everybody, keep the conversation interesting YOU CAN be hostile against others if the situation calls for it or it\'s in your character. You will be given what you think of the persons based on your previous interactions.\n" +
					"## Rules:\n" +
					`- DO NOT reply with a prefix. EXAMPLE: "${this._actorClass.name}: Hello!"\n` + // this._actorClass.name not really needed
					"- DO NOT deviate from the your personality & traits given below. Follow the INSTRUCTION.\n" +
					`- IMPORTANT: DO NOT be long winded if your personality doesn\'t call for it. Keep your messages to a ${(this._actorClass.modelParams.max_tokens || 150) * 0.75} words maximum.\n` +
					"## Optional:\n" +
					'- You may wrap monologues or thoughts in asterisks. EXAMPLE: "*I wonder what they think of me...*"\n' +
					"- When you want to get a faster response from someone, you can address them. EXAMPLE: " +
					'"Hey Suzu, what do you think?"\n' +
					"- Remember, conflict is interesting, spark some if the situation calls for it."
					
			},
			// identity prompt
			{
				role: "system",
				content:
					"# You are: " +
					this._actorClass.name +
					"\n# Description: " +
					this._actorClass.personalityPrompt,
			},
			// relationships
			{
				role: "system",
				content:
					"## People in the chat: " +
					// participants in the stage that are not us
					this.stage.participants
						.filter((p) => p.id.toString() !== this.id.toString())
						.map((p) => (p instanceof User ? p.username : p.actorClass.name))
						.join(", ") +
					"\n# Relationships, with them...\n" +
					this.formatRelationships() + 
					"\n# You just joined the channel after being called upon...\n" + 
					(this.messages.length > 0 ? "# You just joined the conversation after hearing someone call your name..." : ""),
			},
			// one more will be passed by the stage, the summary.
		];
	}

	formatMsgToActorPOV(actorId: string = this.id.toString()) {
		let ret: ChatCompletionMessageParam[] = [];
		for (const message of this.messages) {
			if (message.isActor()) {
				ret.push(message.getChatCompletions(actorId));
			} else if (message.isUser()) {
				ret.push(message.getChatCompletions());
			}
		}
		return ret;
	}

	public async handleMessage() {
		this.isGenerating = true;
		let loadingMsg = await this.webhook.send("is typing...")
		// get completions
		let msg = [...this.formatSystemMessages(), ...this.formatMsgToActorPOV()];
		console.log(msg)
		const completions = await this._getCompletions(msg);
		// send completions
		loadingMsg = await this.webhook.editMessage(loadingMsg, completions.choices[0].message.content ?? "No response");
		this.isGenerating = false;

		// then return the message;
		return loadingMsg;
	}

	private async _getCompletions(messages: ChatCompletionMessageParam[]) {
		return await OpenAIClient.chat.completions.create({
			...this._actorClass.modelParams,
			messages: messages,
		});
	}
}
