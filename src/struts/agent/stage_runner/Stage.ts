// author = shokkunn
import { Channel, ChannelResolvable, ChannelType, Client, Message, MessageCollector, User, Webhook } from "discord.js";
import { EventEmitter} from "events";
import OpenAI  from "openai";

import { ChatCompletionAssistantMessageParam, ChatCompletionMessageParam, ChatCompletionUserMessageParam } from "openai/resources/chat/index.mjs";
import { v4 as generateUUID } from "uuid";
import { StageError } from "./StageUtils";
import DiscordToolHandler from "../../discord/tools/DiscordToolHandler";

export default class Stage extends EventEmitter {
    private _participants: Map<string, | User> = new Map();
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
}

/** Types */

export interface IStageOptions {
    context: Message<boolean>
    OAIClient: OpenAI;
    client: Client;
    webhook: Webhook;
    toolHandler: DiscordToolHandler;
}

export interface IStageRaw {
    id: string;
    participants: string[];
    startedBy: string;
    channelId: string;
}

export interface IBaseStageUserMessage extends ChatCompletionUserMessageParam {
    userId: string;
}

export interface IBaseStageAgentMessage extends ChatCompletionAssistantMessageParam {
    agentId: string;
}