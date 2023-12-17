// author = shokkunn

import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

export interface IModelParams {
    max_tokens: number;
    name: string;
    temperature: number;
    frequency_penalty: number;
    presence_penalty: number;
    top_p: number;
}

export interface IPersonalityArr {
    trait: string;
    value: number;
    situation?: string;
}

export interface IPersonalityParams {
    personalityArr: IPersonalityArr[];
    exampleConvo?: ChatCompletionMessageParam[];
    
}


export default class BaseAgent {
    private _modelParams: IModelParams;
    private _personalityParams: IPersonalityParams;

    constructor() {

    }
}
