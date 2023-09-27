// author = shokkunn

import _, { keys } from "lodash";
import { AgentFuncInterface, PropertyTypes, NestedPropertyTypes } from "./BaseTool";
import { ChatCompletionCreateParams } from "openai/resources/chat/index.mjs";
import { encode } from "gpt-3-encoder"

export default class BaseToolUtils {
    public static validateProperty(input: any, schema: PropertyTypes | NestedPropertyTypes): boolean {
        type StackItem = { input: any; schema: PropertyTypes | NestedPropertyTypes };
        const stack: StackItem[] = [];

        stack.push({ input, schema });

        while (stack.length > 0) {
            const { input, schema } = stack.pop()!;

            const withinNumberRange = (value: number, min?: number, max?: number): boolean =>
                (min === undefined || value >= min) && (max === undefined || value <= max);

            const withinArrayRange = (arr: any[], min?: number, max?: number): boolean =>
                (min === undefined || arr.length >= min) && (max === undefined || arr.length <= max);

            switch (schema.type) {
                case "string":
                case "boolean":
                    if (typeof input !== schema.type) return false;
                    break;
                case "number":
                    if (typeof input !== "number" || !withinNumberRange(input, schema.min, schema.max)) return false;
                    break;
                case "object":
                    if (typeof input !== "object" || Array.isArray(input)) return false;

                    for (const [key, propSchema] of Object.entries(schema.properties || {})) {
                        if (propSchema.required && input[key] === undefined) return false;
                        if (input[key] !== undefined) {
                            stack.push({ input: input[key], schema: propSchema });
                        }
                    }
                    break;
                case "array":
                    if (!Array.isArray(input) || !withinArrayRange(input, schema.min, schema.max)) return false;

                    if (schema.itemType) {
                        for (const item of input) {
                            stack.push({ input: item, schema: schema.itemType });
                        }
                    }
                    break;
            }
        }

        return true;
    }
    public static validateFuncResponse(input: any, schema: AgentFuncInterface): boolean {
        for (const key of Object.keys(schema)) {
            const propSchema = schema[key];
            console.log(propSchema)
        }
        return true;
    }


    public static getFunctionTokens(manifest: ChatCompletionCreateParams.Function): number {
        return encode(JSON.stringify(manifest)).length;
    }
}