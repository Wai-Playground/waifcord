// author = shokkunn

import { Agents } from "@prisma/client";
import AbstractDataClass from "../../base/BaseDataClass";
import { prisma } from "../../../utils/Database";
import { ChatCompletionCreateParams } from "openai/resources/index.mjs";
import winston from "winston";
import { UsersClass } from "../users/Users";

export default class AgentsClass extends AbstractDataClass {
    private _name: string;
    private _disabled: boolean;
    private _wakeWords: string[];
    private _profilePicture: string | null;
    private _modelParams: IAgentModelParams;
    private _personality: IAgentPersonalityParams;
    private _disabledChannels: string[] = [];

    // Cache
    private _toolManifest: ChatCompletionCreateParams.Function[] | undefined;
    
    constructor(data: Agents) {
        super(data);
        this._name = data.name;
        this._disabled = data.disabled;
        this._wakeWords = JSON.parse(data.wakeWords);
        this._profilePicture = data.profilePicture;
        this._modelParams = JSON.parse(data.modelParamsJSON);
        this._personality = JSON.parse(data.personalityJSON)
        this._disabledChannels = JSON.parse(data.disabledChannels);
    }

    get name() {
        return this._name
    }

    get disabled() {
        return this._disabled;
    }

    get disabledChannels() {
        return this._disabledChannels;
    }

    get wakeWords() {
        return this._wakeWords;
    }

    get profilePicture() {
        return this._profilePicture;
    }

    get disabledTools() {
        return this._modelParams.disabledTools;
    }

    get modelParams() {
        return this._modelParams;
    }

    get personality() {
        return this._personality;
    }

    getAllowedToolsManifest(fullManifest: ChatCompletionCreateParams.Function[], disabledTools: string[] = this.disabledTools) {
        if (disabledTools.length === 0) return fullManifest;
        if (this._toolManifest) return this._toolManifest;

        this._toolManifest = fullManifest.filter((tool) => !disabledTools.includes(tool.name));
        return this._toolManifest;
    }

    /** Database Management */

    static async updateAgent(id: string, data: Partial<Agents>) {
        try {
            return await prisma.agents.update({
                where: {
                    id
                },
                data
            });
        } catch (e) {
            winston.error(e);
            return undefined;
        }
    }

    static async getUserProfiles(userIds: string[], agentId: string) {
        try {
            let profiles = await prisma.agentUserProfile.findMany({
                where: {
                    userId: {
                        in: userIds
                    },
                    agentId
                }
            });
            return profiles;
        } catch (e) {
            winston.error(e);
            return [];
        }
    }

    static async getAgentById(id: string): Promise<AgentsClass | undefined> {
        try {
            let agent = await prisma.agents.findUnique({
                where: {
                    id
                }
            });
            if (!agent) return undefined;
            return new AgentsClass(agent);
        } catch (e) {
            winston.error(e);
            return undefined;
        }
    }

    static async getAgentFromName(name: string) {
        try {
            const agent = await prisma.agents.findFirst({
                where: {
                    name: name
                }
            });
            if (!agent) return undefined;
            return new AgentsClass(agent);
        } catch (err) {
            winston.error(err);
            return undefined;
        }
    }

    static async getAllRawWakeWords() {
        try {
            return await prisma.agents.findMany({
                select: {
                    wakeWords: true,
                    id: true
                }
            });
        } catch (err) {
            winston.error(err);
            return [];
        }
    }
}

/** Types */

interface IBaseModelParams {
    temperature: number;
    maxTokens: number;
    topP: number;
    frequencyPenalty: number;
    presencePenalty: number;
}

export interface IAgentModelParams extends IBaseModelParams {
    disabledTools: string[];
}

export interface IAgentPersonalityParams {
    
}