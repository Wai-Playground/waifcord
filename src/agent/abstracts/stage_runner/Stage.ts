// author = shokkunn
import { Channel, ChannelResolvable, ChannelType, Client, Message, MessageCollector, User } from "discord.js";
import { EventEmitter} from "events";
import OpenAI  from "openai";

import { ChatCompletionMessageParam, ChatCompletionUserMessageParam } from "openai/resources/chat/index.mjs";
import { v4 as generateUUID } from "uuid";
import { StageError } from "./StageUtils";

export default class Stage extends EventEmitter {
    private _participants: Map<string, any> = new Map();
    private _stageId: string;
    private _OAIClient: OpenAI;

    /** Discord Stuff */
    private _client: Client;
    private _context: Message<boolean>;
    private _messageListener: MessageCollector | undefined;
    constructor(params: IStageRunnerOptions) {
        super();
        this._stageId = generateUUID();
        this._OAIClient = params.OAIClient;
        this._client = params.client;
        this._context = params.context;
        // set up message listener
        this.setMessageListener(this._context.channel);
    }

    setMessageListener(channel: Channel) {
        if (channel.type !== ChannelType.GuildText) throw new StageError("Message Listener channel must be a text channel.");
        if (this._messageListener) throw new StageError("Message Listener already exists.");
        try {
            this._messageListener = channel.createMessageCollector({
                /**
                 * @todo add filter
                 */
            });
        } catch (e: any) {
            throw new StageError(e.message);
        }
    }

    async start() {
        this.emit("start");
        if (!this._messageListener) throw new StageError("Message Listener does not exist.");
        this._messageListener.on("collect", (message: Message) => {
            
        })
    }

    get stageId(): string {
        return this._stageId;
    }

    get startedBy(): User {
        return this._context.author;
    }
}

/** Types */

export interface IStageRunnerOptions {
    context: Message<boolean>
    OAIClient: OpenAI;
    client: Client;

}

export interface IStageRaw {
    id: string;
    participants: string[];
    startedBy: string;
    channelId: string;
}

export interface IBaseStageUserMessage extends ChatCompletionUserMessageParam {
    
}