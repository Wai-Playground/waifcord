// author = shokkunn

import { Client, Collection } from "discord.js";
import BaseFunctionTool from "./BaseTool";
import BaseHandler, { BaseHandlerOptions } from "../../../base/BaseHandler";

export default class BaseToolHandler extends BaseHandler {
    private _tools: Collection<string, BaseFunctionTool> = new Collection();

    constructor(options: BaseToolHandlerOptions) {
        super(options)
    }

    get tools() {
        return this._tools;
    }

    public addTool(tool: BaseFunctionTool) {
        if (tool!.manifest || tool!.totalTokens) {
            // load the tool if not loaded
            tool.load();
        }
        this._tools.set(tool.id, tool);
    }

    public disableTool(toolName: string) {
        this._tools.get(toolName)?.disable();
    }
}

/** Types */

export interface BaseToolHandlerOptions extends BaseHandlerOptions {
    tools?: BaseFunctionTool[];
    bypassRateLimit: boolean;
}