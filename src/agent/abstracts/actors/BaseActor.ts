// author = shokkunn

import { ChatCompletionMessage } from "openai/resources/chat/index.mjs";

export const defaultActor: RawBaseActorI = {

}

interface PersonalityTraitI {
    trait: string;
    value: number;
}

interface ModelDataI {
    // model data
    model: string;
    temperature: number;
    maxTokens: number;
    topP: number;
    frequencyPenalty: number;
    presencePenalty: number;
}

interface RpInformationI {
    convoPrompt: string;
    personalityDescription: string;
    conversationExample?: ChatCompletionMessage[];
}

/** Raw DB JSON */
export interface RawBaseActorI {
    // identification
    id: string;

    // basic info (not prompted)
    name: string;
    description: string;

    // personality
    personalityArray: PersonalityTraitI[];

    // model data
    modelData?: ModelDataI;
    rpInformation: RpInformationI;
    overrideInstructPrompts?: string[];
    
    // long term memory
    ltmEnabled: boolean;
}

export default class BaseActorClass implements RawBaseActorI {
    // identification
    id: string;

    // basic info
    name: string;
    description: string;

    // personality
    personalityArray: PersonalityTraitI[];

    // model data
    modelData: ModelDataI;

    constructor(raw: RawBaseActorI) {
        this.id = raw.id;
        this.name = raw.name;
        this.description = raw.description;
        this.personalityArray = raw.personalityArray;
        this.modelData = raw.modelData;
    }
}