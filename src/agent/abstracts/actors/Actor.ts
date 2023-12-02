// author = shokkunn

import { ChatCompletionMessage } from "openai/resources/chat/index.mjs";

interface PersonalityTraitI {
    trait: string;
    value: number;
}

export interface RawActorI {
    // identification
    id: string;

    // basic info
    name: string;
    description: string;

    // personality
    systemPrompt: string;
    personalityArray: PersonalityTraitI[];
}

export default class BaseActorClass implements RawActorI {
    // identification
    id: string;

    // basic info
    name: string;
    description: string;

    // personality
    systemPrompt: string;
    personalityArray: PersonalityTraitI[];

    constructor(raw: RawActorI) {
        this.id = raw.id;
        this.name = raw.name;
        this.description = raw.description;
        this.systemPrompt = raw.systemPrompt;
        this.personalityArray = raw.personalityArray;
    }
}