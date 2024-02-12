// author = shokkunn

import { Collection, Message } from "discord.js";
import StageClass from "./Stage";
import mongodb, { ObjectId } from "mongodb"
import Mango, { ActorsCol } from "../../../utils/services/Mango";
import ActorClass, { ActorType } from "../actors/Actor";
import ActorOnStageClass from "../actors/ActorOnStage";
import winston from "winston";

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
    static async fetchActiveWords(): Promise<Collection<string, string[]>>{
        let res;
        // Fetch active words from database
        try {
            res = await ActorClass.fetchActors({
                "$where": "this.wake_words.length > 0"
            }, ["wake_words", "_id"])
    
            for (const actor of res) this._activeWords.set(actor._id.toString(), actor.wake_words);
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
    static async getActiveWords(): Promise<Collection<string, string[]>>{
        return this._activeWords.size == 0 ? await this.fetchActiveWords() : this._activeWords;
    }

    /**
     * @name containsActiveWords
     * @param {string} content 
     * @param {Collection<string, string[]>}checkAgainst 
     * @returns {Promise<string[]>}
     */
    static async containsActiveWords(content: string, checkAgainst: Collection<string, string[]> = this._activeWords): Promise<string[]> {
		try {
			if (checkAgainst.size === 0) checkAgainst = await this.getActiveWords();

            const lowerCaseContent = content.toLowerCase();
            const agentIds = new Set<string>();
    
            checkAgainst.forEach((words, agentId) => {
                const regexPattern = new RegExp(
                    words.map((word) => `\\b${word}\\b`).join("|"),
                    "i"
                );
                if (regexPattern.test(lowerCaseContent)) agentIds.add(agentId);
            });
    
            return [...agentIds];
		} catch (error) {
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
        // Fetch the stage
        let stage = this.stages.get(message.channel.id);
        // If the stage exists, add the message to the stage
        let actorsCalled = await this.containsActiveWords(message.content)

		if (!stage && actorsCalled.length > 0) {
			// Create a new stage
			stage = new StageClass();
			this.stages.set(message.channel.id, stage);
		}

		// Exit if no stage is found
		if (!stage) return;

        // actors that are not in the stage
        let filter = actorsCalled.filter((id) => !stage!.participants.has(id)).map((id) => new ObjectId(id));
        if (filter.length > 0) {
            // Fetch the actors
            const actorsToAdd = await ActorsCol.find({
                "_id": {
                    // funky !stage check
                    "$in": filter
                }
            }).toArray();
    
            // Add the actors to the stage
            for (const actor of actorsToAdd) {
                winston.debug(`Adding actor ${actor._id} to stage ${stage.id}`);
                await stage.addEntity(new ActorOnStageClass(new ActorClass(actor), stage));
            }
        }

        console.log(actorsCalled)
    }   
}