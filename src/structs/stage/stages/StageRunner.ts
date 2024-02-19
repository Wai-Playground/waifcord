// author = shokkunn

import { Collection, Message, TextChannel, Webhook } from "discord.js";
import StageClass from "./Stage";
import { ObjectId } from "mongodb";
import { ActorsCol } from "../../../utils/services/Mango";
import ActorClass, { ActorInterface } from "../actors/Actor";
import ActorOnStageClass from "../actors/ActorOnStage";
import winston from "winston";
import { readActorImageBufferNoExt } from "../../../utils/path/AssetsMan";

export default class StageRunnerClass {
	// Collection<channelId, StageClass[]>
	public static stages: Collection<string, StageClass> = new Collection();
	// Collection<AgentId, wake_words[]>
	private static _activeWords: Collection<string, string[]> = new Collection();

	/**
	 * @name fetchActiveWords
	 * @description Fetches the active words from the database and caches them.
	 * @returns {Promise<Collection<string, string[]>>}
	 */
	static async fetchActiveWords(): Promise<Collection<string, string[]>> {
		let res;
		// Fetch active words from database
		try {
			res = await ActorClass.fetchActors(
				{
					$where: "this.wake_words.length > 0",
				},
				["wake_words", "_id", "name"]
			);

			for (const actor of res)
				this._activeWords.set(actor._id.toString(), [
					actor.name,
					...actor.wake_words,
				]);
			return this._activeWords;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @name getActiveWords
	 * @description Fetches the active words from the database and caches them.
	 * @returns {Promise<Collection<string, string[]>>}
	 */
	static async getActiveWords(): Promise<Collection<string, string[]>> {
		return this._activeWords.size == 0
			? await this.fetchActiveWords()
			: this._activeWords;
	}

	/**
	 * @name containsActiveWords
	 * @param {string} content
	 * @param {Collection<string, string[]>}checkAgainst
	 * @returns {Promise<string[]>}
	 */
	static async containsActiveWords(
		content: string,
		checkAgainst: Collection<string, string[]>
	): Promise<string[]> {
		try {
			const lowerCaseContent = content.toLowerCase();
			const agentIds = new Set<string>();

			for (const [agentId, words] of checkAgainst.entries()) {
				const regexPattern = new RegExp(
					words.map((word) => `\\b${word.toLowerCase()}\\b`).join("|"),
					"i"
				);
				if (regexPattern.test(lowerCaseContent)) agentIds.add(agentId);
			};
			return [...agentIds];
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @name allocateWebhooks
	 * @description Allocates webhooks to agents in a channel
	 * @param {object} data
	 * @param {number} totalActors (Optional)
	 * @returns {Promise<Webhook>}
	 */
	public static async allocateWebhooks(
		data: { name: string; avatarId: string; channel: TextChannel },
		totalActors: number = this._activeWords.size
	): Promise<Webhook> {
		try {
			// check if we have a webhook create by us and with the same name
			let ourWebhooks = (await data.channel.fetchWebhooks()).filter(
				(wh) => wh.owner!.id === data.channel.client.user!.id
			);
			let webhook = ourWebhooks.find((wh) => wh.name === data.name);
			if (webhook) {
				await webhook.edit({
					avatar: await readActorImageBufferNoExt(data.avatarId),
				});
				return webhook;
			}

			// if we still have agents to allocate webhooks to, create a new one
			if (ourWebhooks.size < totalActors) {
				return await data.channel.createWebhook({
					reason: "Agent webhook",
					name: data.name,
					avatar: await readActorImageBufferNoExt(data.avatarId),
				});
			} else {
				// edge case where we have more webhooks than agents, just pick a random one and edit it
				winston.warn(
					"More webhooks than agents, editing a random one. Allocating for: " +
						data.name +
						" in " +
						data.channel.name +
						" in " +
						data.channel.guild.name +
						" with " +
						totalActors +
						" agents."
				);
				let randomAgent = ourWebhooks.random();
				if (!randomAgent) throw new Error("No webhooks found in channel");
				return await randomAgent.edit({
					name: data.name,
					avatar: await readActorImageBufferNoExt(data.avatarId),
				});
			}
		} catch (error) {
			winston.log(
				"fatal",
				`Error allocating webhooks in guild ${data.channel.guild.name} in channel ${data.channel.name}: ${error}`
			);
			throw error;
		}
	}

	/**
	 * @name handleMessage
	 * @description Handles a message and decides whether to pass it to a stage or not.
	 * @param {Message} message
	 * @returns {Promise<void>}
	 */
	public static async handleMessage(message: Message): Promise<void> {
		// Exit if the message is from a bot
		if (message.author.bot) return;
		// Fetch the stage
		let stage = this.stages.get(message.channel.id);
		// If the stage exists, add the message to the stage
		let actorsCalled = await this.containsActiveWords(message.content, await this.getActiveWords());

		if (!stage && actorsCalled.length > 0) {
			// Create a new stage
			stage = new StageClass();
			this.stages.set(message.channel.id, stage);
		}

		// Exit if no stage is found
		if (!stage) return;

		// Add the user to the stage if they are not already in it
		if (!stage.participants.has(message.author.id))
			await stage.addUser(message.author);

		// actors that are not in the stage. funky !stage check.
		let filter = actorsCalled
            // funky, ᗜˬᗜ
			.filter((id) => !stage!.participants.has(id))
			.map((id) => new ObjectId(id));
        
		if (filter.length > 0) {
			// Fetch the actors
			const actorsToAdd = await ActorsCol.find({
				_id: {
					$in: filter,
				},
			}).toArray();

			// Add the actors to the stage
			for (const actor of actorsToAdd) {
				winston.log("debug", `Adding actor ${actor._id} to stage ${stage.id}`);
				try {
					ActorInterface.parse(actor);
				} catch (e) {
					throw new Error(
						`Failed to validate actor data: ${
							e as string
						}. Data: ${JSON.stringify(actor)}`
					);
				}
                // Add the actor to the stage (& allocate webhooks to them)
				await stage.addActor(
					new ActorOnStageClass(
						actor,
						stage,
						await this.allocateWebhooks({
							name: actor.name,
							avatarId: actor._id.toString(),
							channel: message.channel as TextChannel,
						})
					)
				);
			}
		}

		// Add the message to the stage
		await stage.handleMessage(message, actorsCalled);
	}
}
