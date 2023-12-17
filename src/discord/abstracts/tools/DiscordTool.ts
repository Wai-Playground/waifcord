// author = shokkunn

import { Client, Message } from "discord.js";
import BaseFunctionTool from "../../../agent/abstracts/tools/BaseTool";
import { AgentFuncInterface } from "../../../agent/abstracts/tools/BaseTool"

/**
 * @name DiscordTool
 * @description A tool that the AI can use, that can interact with Discord, but is not a command.
 */

export default class DiscordTool extends BaseFunctionTool {
    public options: DiscordToolOptions;

    constructor(id: string, description: string, parameters: AgentFuncInterface, options: DiscordToolOptions) {
        super(id, description, parameters);
        this.options = options;
    }

    /**
     * @name execute
     * @param {Client} client Discord client.
     * @param {Message} message Discord message that triggered the tool.
     * @description entry point of the function.
     */
    override async execute(client: Client, message: Message, ...args: any): Promise<any> {
        throw new Error("Method not implemented.");
    }

    /**
     * @name check
     * @param {Client} client 
     * @param {Message} message 
     * @param {any} args 
     * @returns {boolean} Whether the user can use the tool.
     */
    override async check(client: Client, message: Message, ...args: any): Promise<boolean> {
        return true;
    }
}

/** Types */

interface DiscordPermissionInterface {
    roles: string[];
    users: string[];
    channels: string[];
    ownerOnly: boolean;
}

export interface DiscordToolOptions {
    permissions?: Partial<DiscordPermissionInterface>
    requireConfirmation: boolean // whether to require confirmation before executing the tool.
}