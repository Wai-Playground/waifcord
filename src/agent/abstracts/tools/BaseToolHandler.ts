// author = shokkunn

import { Client, Collection } from "discord.js";
import BaseFunctionTool from "./BaseTool";

export default class BaseToolHandler {
    private _tools: Collection<string, BaseFunctionTool> = new Collection();
    private _options: BaseToolHandlerOptions;

    constructor(options: BaseToolHandlerOptions) {
        this._options = options;
        this._setup();
    }

    get options() {
        return this._options;
    }

    get tools() {
        return this._tools;
    }

    private _setup() {
        for (const tool of this._options.tools!) {
            this.addTool(tool);
        }
    }

    public addTool(tool: BaseFunctionTool) {
        if (tool!.manifest || tool!.totalTokens) {
            // load the tool if not loaded
            tool.load();
        }
        this._tools.set(tool.name, tool);
    }

    public disableTool(toolName: string) {
        this._tools.get(toolName)?.disable();
    }
}

/** Types */

export interface BaseToolHandlerOptions {
    tools?: BaseFunctionTool[];
    bypassRateLimit: boolean;
}