// author = shokkunn

import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { IRawBaseAgent } from "./BaseAgent";

interface IPersonalityArr {
    trait: string;
    value: number;
    situation?: string;
}

interface IPersonalityParams {
    exampleConvo?: ChatCompletionMessageParam[];
    personalityArr: IPersonalityArr[];
}

interface ILTMSettings {
    enabled: boolean;
    overrideKey?: string;
}

export interface IRawPersonalityAgent extends IRawBaseAgent {
    personality: IPersonalityParams;
    ltm: ILTMSettings;
}