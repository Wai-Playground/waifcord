// author = shokkunn

interface IModelParams {
    name: string;
    temperature: number;
    frequency_penalty: number;
    presence_penalty: number;
    top_p: number;
}

export interface IRawBaseAgent {
    id: string;
    wakeWords: string[];
    name: string;
    desc: string;
    model: IModelParams;
}

export default abstract class BaseAgent {
    constructor(protected agent: IRawBaseAgent) {

    }

    get id() {
        return this.agent.id;
    }

    get name() {
        return this.agent.name;
    }

    get desc() {
        return this.agent.desc;
    }

    get wakeWords() {
        return this.agent.wakeWords;
    }
}