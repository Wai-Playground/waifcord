// author = shokkunn

import { ChatCompletionCreateParams, ChatCompletionMessageParam } from "openai/resources/index.mjs";
import BaseModule from "../../base/BaseModule";

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

export default abstract class BaseAgentClass extends BaseModule {
    private _modelParams: IModelParams;
    private _personalityParams: IPersonalityParams;

    constructor(id: string, modelParams: IModelParams, personalityParams: IPersonalityParams) {
        super(id);
        this._modelParams = modelParams;
        this._personalityParams = personalityParams;
    }

    get modelParams() {
        return this._modelParams;
    }

    get personalityParams() {
        return this._personalityParams;
    }
}


