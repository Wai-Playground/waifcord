// author = shokkunn

import { z } from "zod";
import BaseData, { BaseDataInterface } from "../../base/BaseData";

export default class ActorClass extends BaseData {
    constructor(data: ActorType) {
        super(data);

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
  personality_prompt: z.string(),
  model_params: ModelParamatersType
});

export type ActorType = z.infer<typeof ActorInterface>;