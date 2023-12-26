// author = shokkunn
import { Channel, ChannelResolvable, ChannelType, Client, Message, MessageCollector, User, Webhook } from "discord.js";
import { EventEmitter} from "events";
import OpenAI  from "openai";

import { ChatCompletionAssistantMessageParam, ChatCompletionMessageParam, ChatCompletionUserMessageParam } from "openai/resources/chat/index.mjs";
import { v4 as generateUUID } from "uuid";
import { StageError } from "./StageUtils";
import DiscordToolHandler from "../../discord/tools/DiscordToolHandler";
import { UsersClass } from "../users/Users";
import AgentsClass from "../agents/Agents";

export default class StageClass extends EventEmitter {
    private _participants: Map<string, AgentsClass | UsersClass > = new Map();
    private _stageId: string;
    private _OAIClient: OpenAI;

    /** Discord Stuff */
    private _client: Client;
    private _context: Message<boolean>;
    private _webhook: Webhook;
    private _toolHandler: DiscordToolHandler;
    
    /** Tools */
    constructor(params: IStageOptions) {
        super();
        this._stageId = generateUUID();
        this._OAIClient = params.OAIClient;
        this._client = params.client;
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

    async handleMessage(message: Message) {
        // we handle agent messages internally. only for user.
        if (message.webhookId === this._webhook.id || message.author.bot) return;

        // get the user
        const user = this._participants.get(message.author.id);
        if (!user || !(user instanceof UsersClass)) throw new StageError("User not found in stage.");
    }
}

/** Types */

export interface IStageOptions {
    context: Message<boolean>
    OAIClient: OpenAI;
    client: Client;
    webhook: Webhook;
    toolHandler: DiscordToolHandler;
}

export interface IBaseStageUserMessage extends ChatCompletionUserMessageParam {
    userId: string;
}

export interface IBaseStageAgentMessage extends ChatCompletionAssistantMessageParam {
    agentId: string;
}