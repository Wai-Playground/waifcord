// author = shokkunn

import { Message, User } from "discord.js";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import ActorOnStageClass from "../actors/ActorOnStage";

export abstract class BaseStageMessageClass {
    public chatCompletions: ChatCompletionMessageParam;
    public authorId: string;
    public message: Message;
    constructor(data: ChatCompletionMessageParam, authorId: string, message: Message) {
        this.chatCompletions = data;
        this.authorId = authorId;
        this.message = message;
    }

    isUser(): this is UserStageMessageClass {
        return this.message.author instanceof User;
    }

    isActor(): this is ActorStageMessageClass {
        return this.message.author instanceof ActorOnStageClass;
    }
}

export class UserStageMessageClass extends BaseStageMessageClass {
    public user: User;
    constructor(data: ChatCompletionMessageParam, authorId: string, message: Message, user: User) {
        super(data, authorId, message);
        this.user = user;
    }
}

export class ActorStageMessageClass extends BaseStageMessageClass {
    public actor: ActorOnStageClass;
    constructor(data: ChatCompletionMessageParam, authorId: string, message: Message, actor: ActorOnStageClass) {
        super(data, authorId, message);
        this.actor = actor;
    }
}