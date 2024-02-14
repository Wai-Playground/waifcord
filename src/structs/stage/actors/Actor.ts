// author = shokkunn

import { z } from "zod";
import BaseDataClass, { BaseDataInterface } from "../../base/BaseData";
import mongodb from "mongodb";
import { ActorsCol } from "../../../utils/services/Mango";
import { ChatCompletionTool } from "openai/resources/index.mjs";

export default class ActorClass extends BaseDataClass {
	declare data: ActorType;
	public toolManifest: ChatCompletionTool[] | undefined;
	constructor(data: ActorType) {
		super(data);
	}

	get name() {
		return this.data.name;
	}

	get wakeWords() {
		return this.data.wake_words;
	}

	get modelParams() {
		return this.data.model_params;
	}

	isDisabled() {
		return this.data.disabled;
	}

	get disabledTools() {
		return this.data.disabled_tools;
	}

	/**
	 * @name getAllowedToolsManifest
	 * @description Returns the allowed tools manifest for the agent
	 * @param {Array<ChatCompletionTool>} fullManifest
	 * @param {string} disabledTools
	 * @returns {Array<ChatCompletionTool>} The allowed tools manifest
	 */
	getAllowedToolsManifest(
		fullManifest: ChatCompletionTool[],
		disabledTools: string[] | undefined | boolean = this.disabledTools
	): ChatCompletionTool[] {
		// If the manifest has already been generated, return it
		if (this.toolManifest) return this.toolManifest;
		
		// if the tools are defined as booleans: 
		// if true, that means every tool is disabled : if false, that means every tool is enabled
		if (typeof disabledTools == "boolean") return disabledTools ? [] : fullManifest;
	
		// If no tools are disabled, return the full manifest
		if (!disabledTools || disabledTools.length === 0) return fullManifest;

		// Filter out the disabled tools
		this.toolManifest = fullManifest.filter(
			(tool) => !disabledTools.includes(tool.function.name)
		);

		return this.toolManifest;
	}

	/** Database Ops */

	private static async fetchWithProjection<Field extends keyof ActorType>(
		query: mongodb.Filter<ActorType>,
		fields: Field[],
		findOne: boolean = false
	): Promise<Pick<ActorType, Field>[] | Pick<ActorType, Field> | null> {
		const projection: mongodb.FindOptions<ActorType>["projection"] = {};
		for (const field of fields) projection[field] = 1;
		// If findOne is true, return the first result
		if (findOne) {
			const result = await ActorsCol.findOne(query, { projection });
			return result;
		} else {
			const result = await ActorsCol.find(query, { projection }).toArray();
			return result;
		}
	}

	public static async fetchActor<Field extends keyof ActorType>(
		query: mongodb.Filter<ActorType>,
		fields: Field[]
	): Promise<Pick<ActorType, Field> | null> {
		return this.fetchWithProjection(query, fields, true) as Promise<Pick<
			ActorType,
			Field
		> | null>;
	}

	public static async fetchActors<Field extends keyof ActorType>(
		query: mongodb.Filter<ActorType>,
		fields: Field[]
	): Promise<Pick<ActorType, Field>[]> {
		return this.fetchWithProjection(query, fields) as Promise<
			Pick<ActorType, Field>[]
		>;
	}
}

/** Types */

export const ModelParamatersType = z.object({
	frequency_penalty: z.number().optional(),
	max_tokens: z.number().optional(),
	presence_penalty: z.number().optional(),
	temperature: z.number().optional(),
	logit_bias: z.record(z.number()).optional(),
	lobprobs: z.boolean().optional(),
	top_logprobs: z.number().optional(),
	top_p: z.number().optional(),
	model: z.string(),
});

export type ModelParamaters = z.infer<typeof ModelParamatersType>;

export const ActorInterface = BaseDataInterface.extend({
	name: z.string(),
	wake_words: z.array(z.string()),
	disabled: z.boolean().default(false),
	talkativeness: z.number().default(0),
	personality_prompt: z.string(),
	model_params: ModelParamatersType.optional(),
	disabled_tools: z.array(z.string()).or(z.boolean()),
});

export type ActorType = z.infer<typeof ActorInterface>;
