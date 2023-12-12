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
    model: IModelParams;
    name: string;
    desc: string;
    wakeWords: string[];
}