// author = shokkunn

import { z } from "zod";
import BaseDataClass, { BaseDataInterface } from "../../base/BaseData";

export default class ActorClass extends BaseDataClass {
	declare data: ActorType;
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
	model_params: ModelParamatersType,
});

export type ActorType = z.infer<typeof ActorInterface>;
