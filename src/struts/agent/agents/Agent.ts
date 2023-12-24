// author = shokkunn

import { ChatCompletionCreateParams, ChatCompletionMessageParam } from "openai/resources/index.mjs";
import Stage from "../stage_runner/Stage";
import OpenAI from "openai";

export interface IModelParams {
    max_tokens: number;
    model: string;
    temperature: number;
    frequency_penalty: number;
    presence_penalty: number;
    top_p: number;
    logit_bias?: Record<string, number>;
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

export default abstract class BaseAgentClass {
    private _modelParams: IModelParams;
    private _personalityParams: IPersonalityParams;
    private _functionManifest: ChatCompletionCreateParams.Function[];

    constructor(modelParams: IModelParams, personalityParams: IPersonalityParams, functionManifest: ChatCompletionCreateParams.Function[]) {
        this._modelParams = modelParams;
        this._personalityParams = personalityParams;
        this._functionManifest = functionManifest;
    }
}


