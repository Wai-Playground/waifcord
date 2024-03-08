// author = shokkunn

import { Message, User, Webhook } from "discord.js";
import { ChatCompletion, ChatCompletionMessageParam } from "openai/resources/index.mjs";
import ActorOnStageClass from "../actors/ActorOnStage";

export abstract class BaseStageMessageClass {
    public message: Message;
    public authorClass: User | ActorOnStageClass;
    constructor(message: Message, author: User | ActorOnStageClass) {
        this.authorClass = author;
        this.message = message;
    }

    isUser(): this is UserStageMessageClass {
        return this.authorClass instanceof User;
    }

    isActor(): this is ActorStageMessageClass {
        return this.authorClass instanceof ActorOnStageClass;
    }

    normalizeName() {
        let name = this.authorClass instanceof User ? this.authorClass.username || 'unknown' : this.authorClass.actorClass.name;
        // Truncate to 64 characters and replace non-alphanumeric characters with underscores
        if (name.length > 64) name.substring(0, 64);
        return name.replace(/[^a-zA-Z0-9_-]/g, '_');
    }
}
 
export class UserStageMessageClass extends BaseStageMessageClass {
    public user: User;
    constructor(message: Message, user: User) {
        super(message, user);
        this.user = user;
    }

    getChatCompletions() {
        return {
            content: `${this.message.content}`,
            name: this.normalizeName(),
            role: "user"
        } satisfies ChatCompletionMessageParam;
    }
}

export class ActorStageMessageClass extends BaseStageMessageClass {
    public actor: ActorOnStageClass;
    constructor(message: Message, actor: ActorOnStageClass) {
        console.log(message.content)
        super(message, actor);
        this.actor = actor;
    }

    getChatCompletions(calledById: string) {
        let sameAuthor = calledById === this.authorClass.id.toString();
        return {
            content: this.message.content,
            name: this.normalizeName(),
            role: sameAuthor ? "assistant" : "user"
        } satisfies ChatCompletionMessageParam;
    }
}