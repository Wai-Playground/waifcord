// author = shokkunn

import BaseFunctionTool from "../../../agent/abstracts/tools/BaseTool";
import { AgentFuncInterface } from "../../../agent/abstracts/tools/BaseTool"

/**
 * @name DiscordTool
 * @description A tool that the AI can use, that can interact with Discord, but is not a command.
 */

export default class DiscordTool extends BaseFunctionTool {
    public options: DiscordToolOptions;

    constructor(name: string, description: string, parameters: AgentFuncInterface, options: DiscordToolOptions) {
        super(name, description, parameters);
        this.options = options;
    }

    /**
     * @name execute
     * @param {any} client Discord client.
     * @description entry point of the function.
     */
    override async execute(client: any): Promise<any> {
        
    }
}

/** Types */

interface DiscordPermissionInterface {
    permissions: {
        roles: string[];
        users: string[];
    }
}

export interface DiscordToolOptions {
    permissions: DiscordPermissionInterface
    requireConfirmation: boolean // whether to require confirmation before executing the tool.
}