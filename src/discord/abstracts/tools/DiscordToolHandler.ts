// author = shokkunn

import { User } from "discord.js";
import BaseToolHandler, { BaseToolHandlerOptions } from "../../../agent/abstracts/tools/BaseToolHandler";
import DiscordTool from "./DiscordTool";

export default class DiscordToolHandler extends BaseToolHandler {
    constructor(options: DiscordToolHandlerOptions) {
        super(options);
    }

    public preCheckTool(tool: DiscordTool, user: User) {
        
    }
}

/** Types */

export interface DiscordToolHandlerOptions extends BaseToolHandlerOptions {
    tools?: DiscordTool[];
    bypassConfirmation: boolean;
}