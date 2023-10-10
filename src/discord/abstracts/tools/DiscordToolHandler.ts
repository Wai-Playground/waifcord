// author = shokkunn
// Credits: Thank you discord-akairo for providing snippets.
import { Client, Collection, Message, User } from "discord.js";
import DiscordTool from "./DiscordTool";
import BaseHandler, { BaseHandlerOptions } from "../../../base/BaseHandler";

export default class DiscordToolHandler extends BaseHandler {
    declare protected _options: DiscordToolHandlerOptions;
    declare protected _modules: Collection<string, DiscordTool>;

    constructor(options: BaseHandlerOptions) {
        super(options)
    }

    override get modules(): Collection<string, DiscordTool> {
        return this._modules;
    }

    override get options(): DiscordToolHandlerOptions {
        return this._options;
    }

    get totalTokenSpent() {
        return this.modules.reduce((acc, tool) => acc + (tool.totalTokensSpent), 0);
    }

    get totalManifestTokens() {
        return this.modules.reduce((acc, tool) => acc + (tool.totalManifestTokens), 0);
    }

    get toolManifests() {
        return this.modules.map((tool) => tool.manifest);
    }

    
}

/** Types */

export interface DiscordToolHandlerOptions extends BaseHandlerOptions {
    tools?: DiscordTool[];
    tokenLimitPerTool?: number;
    bypassRateLimit: boolean;
    client: Client;
    bypassConfirmation: boolean;
}