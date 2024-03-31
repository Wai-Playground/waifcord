// author = shokkunn

import { Message, User } from "discord.js";
import { ChatCompletionAssistantMessageParam, ChatCompletionMessageParam } from "openai/resources/index.mjs";
import ActorOnStageClass from "../actors/ActorOnStage";

/** @TODO There is a better way to organize these classes */

export abstract class BaseStageMessageClass {
    public message: Message;
    public authorClass: User | ActorOnStageClass | 'tool';
    constructor(message: Message, author: User | ActorOnStageClass | 'tool') {
        this.authorClass = author;
        this.message = message;
    }

    isUser(): this is UserStageMessageClass {
        return this.authorClass instanceof User;
    }

    isActor(): this is ActorStageMessageClass {
        return this.authorClass instanceof ActorOnStageClass;
    }

    isTool(): this is ToolStageMessageClass {
        return this.authorClass === 'tool';
    }

    normalizeName(): string {
        if (this.isTool()) return 'tool';
        let name: string = 'unknown';
        if (this.isUser()) name = this.authorClass.username;
        if (this.isActor()) name = this.authorClass.actorClass.name;
        // Truncate to 64 characters and replace non-alphanumeric characters with underscores
        if (name.length > 64) name.substring(0, 64);
        return name.replace(/[^a-zA-Z0-9_-]/g, '_');
    }
}
 
export class UserStageMessageClass extends BaseStageMessageClass {
    declare authorClass: User;
    constructor(message: Message, user: User) {
        super(message, user);
    }

    getChatCompletionsFormat() {
        return {
            content: `${this.message.content}`,
            name: this.normalizeName(),
            role: "user"
        } satisfies ChatCompletionMessageParam;
    }
}

export class ActorStageMessageClass extends BaseStageMessageClass {
    declare authorClass: ActorOnStageClass;
    public rawCompletions: ChatCompletionAssistantMessageParam;
    constructor(message: Message, rawCompletions: ChatCompletionAssistantMessageParam, actor: ActorOnStageClass) {
        super(message, actor);
        this.rawCompletions = rawCompletions;
    }

    getChatCompletionsFormat(calledById: string) {
        let sameAuthor = (calledById === this.authorClass.id.toString());
        let role: "user" | "assistant" = sameAuthor ? "assistant" : "user"
        if (this.isTool()) role = "assistant";
        return {
            content: this.rawCompletions.content ?? this.message.content,
            name: this.normalizeName(),
            tool_calls: role == "assistant" ? this.rawCompletions.tool_calls : undefined,
            role: role as "user" | "assistant"
        } satisfies ChatCompletionMessageParam;
    }
}

export class ToolStageMessageClass extends BaseStageMessageClass {
    public actor: ActorOnStageClass;
    public messageBuffer: Message[];
    public toolResult: {id: string, result: string};
    constructor(message: Message, toolResult: {id: string, result: string}, actor: ActorOnStageClass, context: Message[]) {
        super(message, "tool");
        this.actor = actor;
        this.messageBuffer = context;
        this.toolResult = toolResult;
    }

    getChatCompletionsFormat() {
        return {
            content: `${this.toolResult.result}`,
            tool_call_id: this.toolResult.id,
            role: "tool",
        } satisfies ChatCompletionMessageParam;
    }
}