// author = shokkunn

import { ChatCompletionCreateParams, ChatCompletionMessageParam } from "openai/resources/index.mjs";
import BaseModule from "../../base/BaseModule";
import { Agents } from "@prisma/client"
import BaseDataClass from "../../base/BaseDataClass";

export interface IModelParams {
    max_tokens: number;
    model: string;
    temperature: number;
    frequency_penalty: number;
    presence_penalty: number;
    top_p: number;
    logit_bias: Record<string, number>;
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

export default class BaseAgentClass extends BaseDataClass {
    private _name: string;
    private _modelParams: IModelParams;
    private _profilePicture: string | null;
    private _personalityParams: IPersonalityParams;
    private _disabled: boolean;

    constructor(data: Agents) {
        super(data)
        this._name = data.name;
        this._profilePicture = data.profilePicture;
        this._modelParams = JSON.parse(data.modelParamsJSON) as IModelParams;
        this._personalityParams = JSON.parse(data.personalityJSON) as IPersonalityParams;
        this._disabled = data.disabled;
    }

    get disabled() {
        return this._disabled;
    }

    get name() {
        return this._name;
    }

    get profilePicture() {
        return this._profilePicture;
    }
    
    get modelParams() {
        return this._modelParams;
    }

    get personalityParams() {
        return this._personalityParams;
    }
}


