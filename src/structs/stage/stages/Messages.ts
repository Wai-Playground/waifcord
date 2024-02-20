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
}

export class UserStageMessageClass extends BaseStageMessageClass {
    public user: User;
    constructor(message: Message, user: User) {
        super(message, user);
        this.user = user;
    }

    getChatCompletions() {
        return {
            content: `${this.user.username}: ${this.message.content}`,
            name: this.user.id,
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
            content: (sameAuthor ? `` : `${this.actor.actorClass.name}: `) + this.message.content,
            name: this.actor.actorClass.id.toString(),
            role: sameAuthor ? "assistant" : "user"
        } satisfies ChatCompletionMessageParam;
    }
}