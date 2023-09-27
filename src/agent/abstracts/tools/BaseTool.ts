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

interface BasePropertyInterface<T> {
    type: "string" | "number" | "boolean" | "object" | "array";
    required?: boolean;
    description: T;
}

export type PropertyTypesWithoutDescription =
    Omit<BooleanPropertyType, 'description'> |
    Omit<NumberPropertyType, 'description'> |
    Omit<StringPropertyType, 'description'> |
    Omit<ObjectPropertyType, 'description'> |
    Omit<ArrayPropertyType, 'description'>;

interface ArrayPropertyType extends BasePropertyInterface<any> {
    type: "array";
    itemType?: PropertyTypesWithoutDescription;
}

interface ObjectPropertyType extends BasePropertyInterface<string> {
    type: "object";
    properties?: Record<string, PropertyTypesWithoutDescription>;
}

interface StringPropertyType extends BasePropertyInterface<string> {
    type: "string";
}

interface NumberPropertyType extends BasePropertyInterface<string> {
    type: "number";
    min?: number;
    max?: number;
}

interface BooleanPropertyType extends BasePropertyInterface<string> {
    type: "boolean";
}

export type PropertyTypes = BooleanPropertyType | NumberPropertyType | StringPropertyType | ObjectPropertyType | ArrayPropertyType;

export interface AgentFuncInterface extends Record<string, unknown> {
    type: "object",
    properties: Record<string, PropertyTypes>
}

export interface BaseFunctionToolOptions {
    rateLimit?: number;
}