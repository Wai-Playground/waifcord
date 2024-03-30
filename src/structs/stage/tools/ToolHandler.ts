// author = shokkunn

import { Collection, Embed, EmbedBuilder, Message, User } from "discord.js";
import BaseHandlerClass, {
	BaseHandlerOptions,
} from "../../base/BaseModHandler";
import BaseFunctionToolClass from "./BaseFuncTool";
import {
	ChatCompletionMessageToolCall,
	ChatCompletionTool,
} from "openai/resources/index.mjs";
import ActorClass from "../actors/Actor";
import ToolUtilitiesClass from "./ToolUtilities";

export default class ToolHandlerClass extends BaseHandlerClass {
	protected declare _modules: Collection<string, BaseFunctionToolClass>;
	private _cachedToolManifest: ChatCompletionTool[] = [];

	constructor(options: BaseHandlerOptions) {
		super(options);
	}

	override get modules(): Collection<string, BaseFunctionToolClass> {
		return this._modules;
	}

	get fullToolManifest(): ChatCompletionTool[] {
		if (this._cachedToolManifest.length) return this._cachedToolManifest;
		else
			return (this._cachedToolManifest = this.modules.map((mod) => {
				return <ChatCompletionTool>{
					type: "function",
					function: mod.functionManifest,
				};
			}));
	}

	public async executeTools(
		tools: ChatCompletionMessageToolCall[],
		actor: ActorClass,
		context: Message[],
		placeholderMessage: Message
	) {
		let ret: {
			id: string;
			result: string;
		}[] = [];
		for (let tool of tools) {
			let module = this.modules.get(tool.function.name)
            let parsedArgs = {};

			if (!module) {
				ret.push({ id: tool.id, result: "TOOL_NOT_FOUND" });
				continue;
			}

            try {
                parsedArgs = JSON.parse(tool.function.arguments);
                ToolUtilitiesClass.validateFuncResponse(parsedArgs, module.params)
            } catch (e) {
                console.log(e)
                ret.push({ id: tool.function.name, result: "INVALID_ARGUMENTS" });
                continue;
            }

			if (!(await module.check(actor, context))) {
				ret.push({ id: tool.id, result: "CHECK_FAILED" });
				continue;
			}
			if (!module.bypassConfirm) {
                
				let res = await ToolUtilitiesClass.askUserForConfirmation(
					placeholderMessage,
					{
						cancel: {
							desc: `\`\`${module.id}\`\` usage cancelled.`,
							title: "Tool Cancelled",
						},
						confirm: {
							desc: `\`\`${module.id}\`\` usage confirmed.`,
							title: "Tool Confirmed",
						},
						prompt: {
							desc: `Would you like to use the tool \`\`${module.id}\`\`?`,
							title: "Tool Confirmation",
						},
						timeout: {
							desc: `\`\`${module.id}\`\` usage timed out.`,
							title: "Tool Timeout",
						},
					},
					context.map((m) => m.author.id),
				);
				if (!res.confirmed) {
					ret.push({
						id: tool.id,
						result: res.timeout ? "TIMED_OUT" : "TOOL_CANCELLED",
					});
					continue;
				}
			}
			let result = await module.execute(actor, context, parsedArgs);
			ret.push({ id: tool.id, result });
		}
		return ret;
	}
}
