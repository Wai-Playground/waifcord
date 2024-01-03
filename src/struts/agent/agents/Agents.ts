// author = shokkunn

import { Agents } from "@prisma/client";
import AbstractDataClass from "../../base/BaseDataClass";
import { prisma } from "../../../utils/Database";
import { ChatCompletionCreateParams } from "openai/resources/index.mjs";
import winston from "winston";

export default class AgentsClass extends AbstractDataClass {
    static instances: Map<string, AgentsClass> = new Map();
    private _name: string;
    private _disabled: boolean;
    private _wakeWords: string[];
    private _profilePicture: string | null;
    private _disabledTools: string[] = [];

    // Cache
    private _toolManifest: ChatCompletionCreateParams.Function[] | undefined;
    
    constructor(data: Agents) {
        if (AgentsClass.instances.has(data.id)) throw new Error("Agent already exists");
        super(data);
        this._name = data.name;
        this._disabled = data.disabled;
        this._wakeWords = data.wakeWords.split(",");
        this._profilePicture = data.profilePicture;
        this._disabledTools = data.disabledTools.split(",");
        AgentsClass.instances.set(this.id, this);
    }

    get name() {
        return this._name
    }

    get disabled() {
        return this._disabled;
    }

    get wakeWords() {
        return this._wakeWords;
    }

    get profilePicture() {
        return this._profilePicture;
    }

    get disabledTools() {
        return this._disabledTools;
    }

    getAllowedToolsManifest(fullManifest: ChatCompletionCreateParams.Function[], disabledTools: string[] = this._disabledTools) {
        if (disabledTools.length === 0) return fullManifest;
        if (this._toolManifest) return this._toolManifest;

        this._toolManifest = fullManifest.filter((tool) => !disabledTools.includes(tool.name));
        return this._toolManifest;
    }

    async getUserProfiles(userIds: string[]) {
        return await prisma.agentUserProfile.findMany({
            where: {
                id: {
                    in: userIds
                },
                agentId: this.id
            }
        });
    }

    async update(data: Partial<Agents>) {
        return await prisma.agents.update({
            data: data,
            where: {
                id: this.id
            }
        });
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
}