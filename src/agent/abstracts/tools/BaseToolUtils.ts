// author = shokkunn

import _, { keys } from "lodash";
import { AgentFuncInterface, PropertyTypes, PropertyTypesWithoutDescription } from "./BaseTool";
import { ChatCompletionCreateParams } from "openai/resources/chat/index.mjs";
import { encode } from "gpt-3-encoder"

export default class BaseToolUtils {
    public static validate(input: any, schema: PropertyTypes | PropertyTypesWithoutDescription): boolean {
        switch (schema.type) {
            case "boolean":
                return typeof input === "boolean";
            case "number":
                console.log(input)
                if (typeof input !== "number") return false;
                if (schema.min !== undefined && input < schema.min) return false;
                if (schema.max !== undefined && input > schema.max) return false;
                return true;
            case "string":
                return typeof input === "string";
            case "object":
                if (typeof input !== "object" || Array.isArray(input)) return false;
                if (!schema.properties) return true;
                for (const key of Object.keys(schema.properties)) {
                    const propSchema = schema.properties[key];
                    if (propSchema.required && input[key] === undefined) return false;
                    if (input[key] !== undefined && !this.validate(input[key], propSchema)) return false;
                }
                return true;
            case "array":
                if (!Array.isArray(input)) return false;
                if (!schema.itemType) return true;  // if no item type specified, any array is valid
                for (const item of input) {
                    if (!this.validate(item, schema.itemType)) return false;
                }
                return true;
            default:
                return false;
        }
    }


    public static getFunctionTokens(manifest: ChatCompletionCreateParams.Function): number {
        return encode(JSON.stringify(manifest)).length;
    }
}