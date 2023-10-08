// author = shokkunn

import { Client, Collection } from "discord.js";
import BaseFunctionTool from "./BaseTool";
import BaseHandler, { BaseHandlerOptions } from "../../../base/BaseHandler";

export default class BaseToolHandler extends BaseHandler {
    declare protected _modules: Collection<string, BaseFunctionTool>;

    constructor(options: BaseToolHandlerOptions) {
        super(options)
    }

    override get modules(): Collection<string, BaseFunctionTool> {
        return this._modules;
    }
}

/** Types */

export interface BaseToolHandlerOptions extends BaseHandlerOptions {
    tools?: BaseFunctionTool[];
    bypassRateLimit: boolean;
}