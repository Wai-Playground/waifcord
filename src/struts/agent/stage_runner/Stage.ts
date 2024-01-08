// author = shokkunn
import { Channel, ChannelResolvable, ChannelType, Client, Collection, Message, MessageCollector, User, Webhook } from "discord.js";
import { EventEmitter } from "events";
import OpenAI from "openai";

import { ChatCompletionAssistantMessageParam, ChatCompletionMessageParam, ChatCompletionUserMessageParam } from "openai/resources/chat/index.mjs";
import { v4 as generateUUID } from "uuid";
import StageUtils, { StageError } from "./StageUtils";
import DiscordToolHandler from "../../discord/tools/DiscordToolHandler";
import { UsersClass } from "../users/Users";
import AgentsClass from "../agents/Agents";
import winston from "winston";
import { settings } from "../../../utils/Settings";
import StageRunnerClass from "./StageRunner";
import { OpenAIClient } from "../../../utils/OpenAI";

export default class StageClass extends EventEmitter {
    private _participants: Collection<string, AgentsClass | UsersClass> = new Collection();
    private _stageId: string;

    /** Discord Stuff */
    private _client: Client;
    private _webhook: Webhook;
    private _context: Message<boolean>;
    private _toolHandler: DiscordToolHandler;

    /** Tools */
    constructor(params: IStageOptions) {
        super();
        this._stageId = generateUUID();
        this._client = params.context.client;
        this._context = params.context;

        this._webhook = params.webhook;
        this._toolHandler = params.toolHandler;
    }

    get stageId(): string {
        return this._stageId;
    }

    get startedBy(): User {
        return this._context.author;
    }

    get participants(): Map<string, AgentsClass | UsersClass> {
        return this._participants;
    }

    async sendAgentMessage(agent: AgentsClass, message: IBaseStageAgentMessage) {

    }

    async addUserToStage(userId: string) {
        try {
            let user = await UsersClass.getUserById(userId);
            if (!user) throw new StageError("User not found");
            if (user.blacklisted) throw new StageError("User is blacklisted");

            // add the user to the stage
            this.emit("userJoined", user);
            this._participants.set(userId, user);
        } catch (e) {
            winston.error(e);
            throw e;
        }
    }

    async removeUserFromStage(user: UsersClass) {
        try {
            this.emit("userLeft", user);
            this._participants.delete(user.id);
        } catch (e) {
            winston.error(e);
        }
    }

    async addAgentToStage(agentId: string) {
        try {
            let agent = await AgentsClass.getAgentById(agentId);
            // check if agent exists, is enabled, and not already in stage
            if (!agent) throw new StageError("Agent not found");
            if (agent.disabled) throw new StageError("Agent is disabled");
            if (this._participants.has(agent.id)) throw new StageError("Agent already in stage");
            // add the agent to the stage
            this.emit("agentJoined", agent);
            this._participants.set(agent.id, agent);
        } catch (e) {
            winston.error(e);
        }
    }

    async removeAgentFromStage(agentId: string) {
        try {
            this.emit("agentLeft", agentId);
            this._participants.delete(agentId);
        } catch (e) {
            winston.error(e);
        }
    }

    async handleMessage(message: Message) {
        
    }

}

/** Types */

export interface IStageOptions {
    context: Message<boolean>
    toolHandler: DiscordToolHandler;
    webhook: Webhook;
}

export interface IBaseStageUserMessage extends ChatCompletionUserMessageParam {
    userId: string;
}

export interface IBaseStageAgentMessage extends ChatCompletionAssistantMessageParam {
    agentId: string;
}