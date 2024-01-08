// author = shokkunn

import { Collection, Guild, Message, MessageType, Webhook } from "discord.js";
import AgentsClass from "../agents/Agents";
import StageClass from "./Stage";
import { settings } from "../../../utils/Settings";
import StageUtils, { StageError } from "./StageUtils";
import { UsersClass } from "../users/Users";
import DiscordToolHandler from "../../discord/tools/DiscordToolHandler";
import winston from "winston";

export default class StageRunnerClass {
    // <channelId, Stage>
    static stages: Collection<string, StageClass> = new Collection();

    private static async isAgentAlreadyInStage(agentId: string, stages: Collection<string, StageClass> = this.stages): Promise<boolean> {
        for (let stage of stages.values()) {
            if (stage.participants.has(agentId)) return true;
        }

        return false;
    }

    public static async handleMessage(message: Message) {
        let agentsCalled: string[], 
            webhook: Webhook, 
            toolHandler: DiscordToolHandler, 
            stage: StageClass | undefined, 
            user: UsersClass | AgentsClass | undefined;

        // we handle agent messages internally. only for user.
        if (message.webhookId ||
            message.author.bot ||
            message.type != MessageType.Default) return;

        // we only handle messages in guild text channels. (not sure why below it still thinks its not a guild channel)
        if (!message.channel.isTextBased() || message.channel.isDMBased()) return;


        // moderate message if enabled
        if ((await settings())?.OAImoderation) {
            let moderated = await StageUtils.handleModeration(message.content);
            // TODO: handle moderation
            if (moderated.length > 0) return;
        }

        // see if an agent is being called.
        agentsCalled = await StageUtils.containsAgentWakeWord(message.content);

        stage = this.stages.get(message.channel.id);
        if (!stage) {
            // no agents being called, so we don't need to create a stage. It's a normal message.
            if (agentsCalled.length == 0) return; else {
                // get the toolHandler
                toolHandler = await StageUtils.getToolHandler();
                if (!toolHandler) return;

                // get the stage. If the stage is not set then (if agents are called, create a stage)
                webhook = await StageUtils.fetchWebhook(message.guild as Guild);
                if (!webhook) return;

                // create a stage since agent(s) are being called.
                stage = new StageClass({
                    context: message,
                    webhook: webhook,
                    toolHandler: toolHandler
                });

                // set the stage (hehe get it?)
                this.stages.set(message.channel.id, stage);
            }
        }

        // since we now know this is just a normal message, no agents, we can just return.
        if (!stage) return;

        /** DEBUG */
        stage.on("agentJoined", (agent) => winston.log("info", `agent joined ${agent.name}`));
        stage.on("agentLeft", () => winston.log("info", "agent left"));
        stage.on("userJoined", () => winston.log("info", "user joined"));
        stage.on("userLeft", () => winston.log("info", "user left"));

        // Check if the user is already in the stage
        user = stage.participants.get(message.author.id);
        if (user instanceof AgentsClass) throw new StageError("User is an agent, not a user. How.");

        if (!user) {
            // Check if the user exists in the database
            user = await UsersClass.getUserById(message.author.id);

            if (!user) {
                // Create a new user and add them to the database
                user = await UsersClass.createUser({
                    data: { id: message.author.id, name: message.author.username }
                });
            }

            // Add the user to the stage
            try {
                await stage.addUserToStage(user.id);
            } catch (e) {
                winston.error(e);
            }
        }

        // add the agent to the stage
        for (let agentId of agentsCalled) {
            // TODO: handle if agent is already in stage.
            if (await this.isAgentAlreadyInStage(agentId)) continue;
            else await stage.addAgentToStage(agentId);
        }

    }
}