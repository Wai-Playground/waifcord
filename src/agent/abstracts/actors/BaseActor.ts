// author = shokkunn

interface IPersonalityArr {
    trait: string;
    weight: number;
    situation?: string;
}

type TModelParams = {
    model: string;
    topP: number;
    temperature: number;
    frequencyPenalty: number;
    presencePenalty: number;
}

export interface IRawBaseActor {
    // internal Id
    id: string;

    // public
    name: string;
    desc: string;
    profilePicture: string;

    // system prompting
    overrideSysPrompt: boolean;
    systemPrompts?: string[];

    // personality
    personalityArr: IPersonalityArr[];
    personalityDesc: string;

    // model params
    modelParams?: TModelParams;
}


export default class BaseActorClass {
    protected _data: IRawBaseActor;
    constructor(data: IRawBaseActor) {
        this._data = data;
    }

    get id() {
        return this._data.id;
    }

    get name() {
        return this._data.name;
    }

    get desc() {
        return this._data.desc;
    }

    get profilePicture() {
        return this._data.profilePicture;
    }

    get overrideSysPrompt() {
        return this._data.overrideSysPrompt;
    }

    get systemPrompts() {
        return this._data.systemPrompts;
    }

    get personalityArr() {
        return this._data.personalityArr;
    }

    get personalityDesc() {
        return this._data.personalityDesc;
    }

    get modelParams() {
        return this._data.modelParams;
    }

    get export() {
        return this._data;
    }
}