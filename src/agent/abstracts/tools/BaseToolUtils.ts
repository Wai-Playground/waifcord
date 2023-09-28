// author = shokkunn

import { AgentFuncInterface, PropertyTypes, NestedPropertyTypes } from "./BaseTool";
import { ChatCompletionCreateParams } from "openai/resources/chat/index.mjs";
import { encode } from "gpt-3-encoder"

export default class BaseToolUtils {
    /**
     * checks if a number is within a range
     * @param {number} value of the number to check
     * @param {number} min optional
     * @param {number} max optional
     * @returns {boolean}
     */
    private static withinNumberRange(value: number, min?: number, max?: number): boolean {
        return (min === undefined || value >= min) && (max === undefined || value <= max);
    }

    /**
     * checks if an array is within a range
     * @param {any[]} arr of the number to check
     * @param {number} min optional
     * @param {number} max optional
     * @returns {boolean}
     */
    private static withinArrayRange(arr: any[], min?: number, max?: number): boolean {
        return (min === undefined || arr.length >= min) && (max === undefined || arr.length <= max);
    }

    /**
     * Checks if a JSON object is valid against a PropertyTypes or NestedPropertyTypes schema
     * @param {object} input JSON object to check
     * @param {PropertyTypes | NestedPropertyTypes} propSchema to check against
     * @returns 
     */
    public static validateProperty(input: object, propSchema: PropertyTypes | NestedPropertyTypes): boolean {
        // initialize stack
        type StackItemType = { input: any; propSchema: PropertyTypes | NestedPropertyTypes };
        const stack: StackItemType[] = [{ input, propSchema }];

        while (stack.length > 0) {
            const { input, propSchema } = stack.pop()!;

            switch (propSchema.type) {
                // same checks for string and boolean
                case "string":
                case "boolean":
                    if (typeof input !== propSchema.type) return false;
                    break;
                case "number":
                    // if the input is not a number or is not within the range, return false
                    if (typeof input !== "number" || !this.withinNumberRange(input, propSchema.min, propSchema.max)) return false;
                    break;
                case "object":
                    // if the input is not an object or is an array, return false
                    if (typeof input !== "object" || Array.isArray(input)) return false;
                    // loop through each prop in the schema
                    for (const [key, secPropSchema] of Object.entries(propSchema.properties || {})) {
                        // if the prop is required and is not in the input, return false
                        if (secPropSchema.required && input[key] === undefined) return false;
                        // we push the prop into the stack
                        if (input[key] !== undefined) stack.push({ input: input[key], propSchema: secPropSchema });   
                    }
                    break;
                case "array":
                    if (!Array.isArray(input) || !this.withinArrayRange(input, propSchema.min, propSchema.max)) return false;
                    // if the array has an itemType, we push each item into the stack to check
                    if (propSchema.itemType) 
                        for (const item of input) stack.push({ input: item, propSchema: propSchema.itemType });
                    break;
            }
        }

        return true;
    }

    /**
     * Checks if a JSON object is valid against a AgentFuncInterface schema 
     * (which are just PropertyTypes and NestedPropertyTypes)
     * @param {object} input 
     * @param {AgentFuncInterface} schema 
     * @returns {boolean}
     */
    public static validateFuncResponse(input: object, schema: AgentFuncInterface): boolean {
        for (const key of Object.keys(schema.properties)) {
            const propValue = input[key as keyof typeof input];
            const propSchema = schema.properties[key as keyof typeof input];
            // If the prop is required and is not in the input, return false.
            if (propSchema.required && propValue === undefined) return false;
            // If the prop is in the input, validate it.
            if (propValue !== undefined && !this.validateProperty(propValue, propSchema)) return false;
        }
        return true;
    }

    /**
     * Gives the number of tokens a function manifest takes up
     * @param {ChatCompletionCreateParams.Function} manifest to check
     * @returns {number}
     */
    public static getFunctionTokens(manifest: ChatCompletionCreateParams.Function): number {
        return encode(JSON.stringify(manifest)).length;
    }
}