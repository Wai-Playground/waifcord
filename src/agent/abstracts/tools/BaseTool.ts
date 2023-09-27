// author = shokkunn

import { ChatCompletionCreateParams } from "openai/resources/chat/completions.mjs";
import BaseToolUtils from "./BaseToolUtils";

/**
 * A function tool that a Tomo can use. 
 * Does not have permission checking and is not a command.
 */
export default abstract class BaseFunctionTool {
    public name: string;
    public description: string;
    public parameters: AgentFuncInterface = {
        type: "object",
        properties: {}
    }
    
    public rateLimit: number;
    private totalTokens?: number;
    private manifest?: ChatCompletionCreateParams.Function;
    private enabled: boolean = false;

    constructor(name: string, description: string, parameters: AgentFuncInterface, options?: BaseFunctionToolOptions) {
        this.name = name;
        this.description = description;
        this.parameters = parameters;
        this.rateLimit = options?.rateLimit || 0;
        this.load();
    }

    public getTokens() {
        return this.totalTokens;
    }

    public getManifest() {
        return this.manifest;
    }

    public isEnabled() {
        return this.enabled;
    }

    /**
     * Loads the function manifest and total tokens.
     * @returns {void}
     */
    public load(): void {
        this.manifest = this.getFunctionManifest();
        this.totalTokens = BaseToolUtils.getFunctionTokens(this.manifest);
        this.enabled = true;
    }

    /**
     * Generates a function manifest to use during in function calling. 
     * @param {string} name of the function.
     * @param {string} description of the function.
     * @param {BaseFunctionTool} parameters or arguments of the function.
     * @returns {ChatCompletionCreateParams.Function} An object of the function manifest.
     */
    public getFunctionManifest(
        name: string = this.name,
        description: string = this.description,
        parameters: AgentFuncInterface = this.parameters): ChatCompletionCreateParams.Function {

        return {
            "name": name,
            "description": description,
            "parameters": {
                type: "object",
                ...parameters,
                required: Object.keys(parameters.properties).filter(key => parameters.properties[key].required)
            },
        }
    }

    /**
     * Executes the function.
     * @param {...any} args
     * @returns {any} The result of the function.
     */
    public async execute(...args: any): Promise<any> {
        throw new Error("Not implemented");
    }

    /**
     * Checks if the function can be executed.
     * @param {...any} args
     * @returns {boolean} Whether the function can be executed.
     */
    public async check(...args: any): Promise<boolean> {
        return true;
    }
}

/** Types */

interface BasePropertyInterface {
    type: "string" | "number" | "boolean" | "object" | "array";
    required?: boolean;
    description: string;
}

export type NestedPropertyTypes =
    Omit<BooleanPropertyType, 'description'> |
    Omit<NumberPropertyType, 'description'> |
    Omit<StringPropertyType, 'description'> |
    Omit<ObjectPropertyType, 'description'> |
    Omit<ArrayPropertyType, 'description'>;

interface RangeBasedPropertyType extends BasePropertyInterface {
    min?: number;
    max?: number;
}

interface ArrayPropertyType extends RangeBasedPropertyType {
    type: "array";
    itemType?: NestedPropertyTypes;
}

interface ObjectPropertyType extends BasePropertyInterface {
    type: "object";
    properties?: Record<string, NestedPropertyTypes>;
}

interface StringPropertyType extends BasePropertyInterface {
    type: "string";
}

interface NumberPropertyType extends RangeBasedPropertyType {
    type: "number";
}

interface BooleanPropertyType extends BasePropertyInterface {
    type: "boolean";
}

export type PropertyTypes = BooleanPropertyType | NumberPropertyType | StringPropertyType | ObjectPropertyType | ArrayPropertyType;

export interface AgentFuncInterface extends Record<string, unknown> {
    properties: Record<string, PropertyTypes>
}

export interface BaseFunctionToolOptions {
    rateLimit?: number;
}