// author = shokkunn

import { ModerationCreateParams } from "openai/resources/moderations.mjs";
import { ModelParamaters } from "../structs/stage/actors/Actor";
import { EmbeddingCreateParams } from "openai/resources/embeddings.mjs";

/** Paths & Db */

export const DefaultPaths = {
    listenersPath: "src/listeners/",
	interactionsPath: "src/interactions/",
	toolsPath: "src/tools/",
    avatarsPath: "assets/avatars/",
} as const;

export const DatabaseNamespaces = {
    actors: "actors",
    users: "users",
    relationships: "relationships",
    stages: "stages",
} as const;

/** OpenAI Defaults */

export const DefaultModelParams: ModelParamaters = {
	model: ,
	temperature: 0.72,
	max_tokens: 150,
	frequency_penalty: 0.6,
	presence_penalty: 0.4,
} as const;

export const DefaultModerationModel: ModerationCreateParams["model"] =
	"text-moderation-latest" as const;

export const DefaultEmbeddingModel: EmbeddingCreateParams["model"] =
	"text-embedding-3-large" as const;

/** Stage Defaults */

export const DefaultStageMessageBufferLimit = 4 as const;
export const DefaultStageMessageBufferTimeMS = 2300 as const;
export const DefaultActorTurns = 2 as const;
export const DefaultUseNLP = true as const;

