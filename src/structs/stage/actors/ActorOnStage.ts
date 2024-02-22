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
	ChatCompletionSystemMessageParam,
} from "openai/resources/index.mjs";
import { DefaultActorTurns } from "../../../utils/Constants";
import { BaseStageMessageClass } from "../stages/Messages";
import winston from "winston";

export default class ActorOnStageClass {
	private _actorClass: ActorClass;
	public isGenerating: boolean = false;

	public stage: StageClass;
	public webhook: Webhook;
	public relationships: Collection<string, RelationshipClass> =
		new Collection();

	private _turnsLeft: number = DefaultActorTurns;
	public priorityCalled: boolean = false;
	public tokensUsed: number = 0;

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

	public formatIdentityPrompt() {
		return {
			role: "system",
			content:
				"You are: " +
				this._actorClass.name +
				"\n Description: " +
				this._actorClass.personalityPrompt,
		} as ChatCompletionSystemMessageParam;
	}

	public formatSystemMessages(summary?: string): ChatCompletionMessageParam[] {
		let ret: ChatCompletionMessageParam[] = [
			// base instructions
			{
				role: "system",
				content:
				/** @TODO Refix this */
					"# INSTRUCTIONS:\n" +
					//`- You are now the character as mentioned above. Reply as they would. You are not someone pretending to be them. You ARE them.\n` +
					`- Reply as you would normally, without a prefix. EXAMPLE: "Hello!"\n` + // this._actorClass.name not really needed
					"- Do not speak for others, only for yourself.\n" +
					//"- Fourth wall breaks or self referencial statements are discouraged. Example:\"As a cynical highschool student, I have no interest in the likes of you.\"\n" +
					"- Condense your dialogue as to not draw out the conversation.`\n" +
					"- **Talk naturally and in-character**.\n" +
					//"- Keep in mind the person you are talking to and respond accordingly.\n" +
					"- Conflict is interesting but only spark it if the situation calls for it.\n" +
					"- You may wrap actions in asterisks. For example: \"*Hands him the glass of water* There you go.\"\n" +
					/*
					"## Optional:\n" +
					'- You may wrap your thoughts in asterisks. But don\'t use quotes for speech. EXAMPLE: "*I wonder what they think of me...*"\n' +
					
					"- When you want to get a faster response from someone, you can address them. EXAMPLE: " +
					'"Hey Suzu, what do you think?"\n' +
					*/
					"- Use the character\'s voice, not someone pretending to be the character. You are the character, not an AI.\n"
			},
			// identity prompt 	
			// relationships
			this.formatIdentityPrompt(),
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
					"\n# You just joined the channel after being called upon...\n"
					//(this.messages.length > 0 ? "# You just joined the conversation after hearing someone call your name..." : ""),
			},
			{
				role: "system",
				"content": "## Summary of Conversation: " + (summary ?? "No summary yet.") + "\n"
			}
			// one more will be passed by the stage, the summary.
		];
		return ret;
	}

	formatMsgToActorPOV(messages: BaseStageMessageClass[]) {
		let ret: ChatCompletionMessageParam[] = [];
		for (const message of messages) {
			if (message.isActor()) {
				ret.push(message.getChatCompletions(this.actorClass.id.toString()));
			} else if (message.isUser()) {
				ret.push(message.getChatCompletions());
			}
		}
		return ret;
	}

	public async handleMessage(messages: BaseStageMessageClass[], summary?: string) {
		this.isGenerating = true;
		let loadingMsg = await this.webhook.send("is typing...")
		// get completions
		let msg = [...this.formatSystemMessages(summary), ...this.formatMsgToActorPOV(messages)];
		console.log(msg)
		const completions = await this._getCompletions(msg);
		console.log(completions.choices[0].finish_reason)
		this.tokensUsed += completions.usage?.total_tokens ?? 0;
		// send completions
		loadingMsg = await this.webhook.editMessage(loadingMsg, completions.choices[0].message.content ?? "No response");
		this.isGenerating = false;

		// then return the message;
		return {
			message: loadingMsg,
			rawCompletions: completions,
		};
	}

	private async _getCompletions(messages: ChatCompletionMessageParam[]) {
		try {
			return await OpenAIClient.chat.completions.create({
				...this._actorClass.modelParams,
				messages: messages,
			});
		} catch (e) {
			winston.log("fatal", "Failed to get completions: " + e);
			throw e;
		}
	}
}
