// author = shokkunn

import { ChatCompletionCreateParams } from "openai/resources/chat/completions.mjs";

interface BasePropertyInterface<T> {
    type: "string" | "number" | "boolean" | "object" | "array";
    required?: boolean;
    description: T;
}

interface ArrayPropertyType extends BasePropertyInterface<string> {
    type: "array";
    itemType?: "string" | "number" | "boolean";
}

interface ObjectPropertyType extends BasePropertyInterface<string> {
    type: "object";
    properties: Record<string, PropertyTypesWithoutDescription>;
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

// don't include description in the type
type PropertyTypesWithoutDescription =
    Omit<BooleanPropertyType, 'description'> |
    Omit<NumberPropertyType, 'description'> |
    Omit<StringPropertyType, 'description'> |
    Omit<ObjectPropertyType, 'description'> |
    Omit<ArrayPropertyType, 'description'>;

export type PropertyTypes = BooleanPropertyType | NumberPropertyType | StringPropertyType | ObjectPropertyType | ArrayPropertyType;

export interface AgentFuncInterface extends Record<string, unknown> {
    type: "object",
    properties: Record<string, PropertyTypes>
}

const nSchema: AgentFuncInterface = {
    "properties": {
        "param1": {
            "type": "array",
            "itemType": "number",
            "description": "This is a description",
            "required": true
        },
        "param2": {
            "type": "object",
            "description": "This is a description",
            "properties": {
                "keyOne": {
                    "type": "object",
                    "properties": {
                        "keyTwo": {
                            "type": "number"
                        },
                        "keyThree": {
                            "type": "string"
                        }
                    }
                }
            }
        },
        "param3": {
            "type": "string",
            "description": "This is a description"
        },
        "param4": {
            "type": "boolean",
            "description": "This is a description"
        }
    },
    "type": "object"
}

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

    public enabled: boolean = true;

    constructor(name: string, description: string, parameters?: AgentFuncInterface) {
        this.name = name;
        this.description = description;
        parameters && (this.parameters = parameters);
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