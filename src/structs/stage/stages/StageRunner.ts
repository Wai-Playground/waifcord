// author = shokkunn

import { Collection, Message } from "discord.js";
import StageClass from "./Stage";
import mongodb from "mongodb"
import UserClass from "../users/User";
import Mango, { ActorsCol } from "../../../utils/services/Mango";
import ActorClass, { ActorType } from "../actors/Actor";
import ActorOnStageClass from "../actors/ActorOnStage";

export default class StageRunnerClass {
    
    public static stages: Collection<string, StageClass> = new Collection();
    // Collection<AgentId, StageId>
    public static activeWords: Collection<string, string[]> = new Collection();

    static async fetchActiveWords() {
        // Fetch active words from database
        const test = await ActorClass.fetchActors({
            "$where": "this.wake_words.length > 0"
        }, ["wake_words", "_id"])

        console.log(test[0].wake_words)
    }
    /**
     * @name handleMessage
     * @description Handles a message and decides whether to pass it to a stage or not.
     * @param {Message} message 
     * @returns {Promise<void>}
     */
    async handleMessage(message: Message): Promise<void> {
    }   
}