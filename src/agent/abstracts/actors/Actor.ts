// author = shokkunn

import { ChatCompletionMessage } from "openai/resources/chat/index.mjs";

export interface RawActor {
    // identification
    id: string;

    // basic info
    name: string;
    description: string;

    // personality
    systemPrompt: string;
    exampleConversation?: ChatCompletionMessage[]
}

export default abstract class Tomo {

}