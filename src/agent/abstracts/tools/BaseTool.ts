// author = shokkunn

import { ChatCompletionCreateParams } from "openai/resources/chat/completions.mjs";
import BaseToolUtils, { BaseToolError } from "./BaseToolUtils";
import BaseModule from "../../../base/BaseModule";

/**
 * A function tool that a Tomo can use. 
 * Does not have permission checking and is not a command.
 */
export default abstract class BaseFunctionTool extends BaseModule {
    private _description: string;
    private _parameters: AgentFuncInterface = {
        type: "object",
        properties: {}
    }
    
    private _rateLimit: number;
    private _totalManifestTokens: number;
    private _manifest: ChatCompletionCreateParams.Function;
    private _tokensSpent: {
        prompt: number,
        generation: number,
    } = {
            prompt: 0,
            generation: 0,
        }

    constructor(id: string, description: string, parameters: AgentFuncInterface, options?: BaseFunctionToolOptions) {
        super(id);
        this._description = description;
        this._parameters = parameters;
        this._rateLimit = options?.rateLimit || 0;
        this._manifest = this.getFunctionManifest();
        this._totalManifestTokens = BaseToolUtils.getFunctionTokens(this._manifest);
    }

    get description() {
        return this._description;
    }

    get parameters() {
        return this._parameters;
    }

    get rateLimit() {
        return this._rateLimit;
    }

    get tokensSpent() {
        return this._tokensSpent;
    }

    get totalTokensSpent() {
        return this._tokensSpent.prompt + this._tokensSpent.generation;
    }

    get totalManifestTokens() {
        return this._totalManifestTokens;
    }

    get manifest() {
        return this._manifest;
    }

    /**
     * Generates a function manifest to use during in function calling. 
     * @param {string} id of the function.
     * @param {string} description of the function.
     * @param {BaseFunctionTool} parameters or arguments of the function.
     * @returns {ChatCompletionCreateParams.Function} An object of the function manifest.
     */
    public getFunctionManifest(
        id: string = this.id,
        description: string = this.description,
        parameters: AgentFuncInterface = this.parameters): ChatCompletionCreateParams.Function {
        if (this._manifest) return this._manifest; else return {
            "name": id,
            "description": description,
            "parameters": {
                type: "object",
                ...parameters,
                required: Object.keys(parameters.properties).filter(key => 
                    parameters.properties[key as keyof typeof parameters.properties].required)
            },
        }
    }

    /**
     * Executes the function.
     * @param {...any} args
     * @returns {any} The result of the function.
     */
    public async execute(...args: any): Promise<any> {
        throw new BaseToolError("Execute method not implemented");
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
    properties?: Record<Lowercase<string>, NestedPropertyTypes>;
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
    properties: Record<Lowercase<string>, PropertyTypes>
}

export interface BaseFunctionToolOptions {
    rateLimit?: number;
}