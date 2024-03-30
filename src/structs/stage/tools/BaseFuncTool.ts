// author = shokkunn

import BaseModuleClass from "../../base/BaseMod";
import { FunctionDefinition } from "openai/resources/shared.mjs";
import ActorOnStageClass from "../actors/ActorOnStage";
import { Message, User } from "discord.js";
import ActorClass from "../actors/Actor";
import { BaseStageMessageClass } from "../stages/Messages";

export default abstract class BaseFunctionToolClass extends BaseModuleClass {
	public desc: string;
	public bypassConfirm: boolean;
	protected _parameters: AgentFuncInterface = {
		type: "object",
		properties: {},
	};
	protected _generatedManifest: FunctionDefinition;

	constructor(id: string, desc: string, params: AgentFuncInterface, bypassConfirm = false) {
		super(id);
		this.desc = desc;
		this.bypassConfirm = bypassConfirm;
		this._parameters = params;
		this._generatedManifest = this.generateFunctionManifest();
	}

	get functionManifest() {
		return this._generatedManifest;
	}

	get params() {
		return this._parameters;
	}

	/**
	 * Generates a function manifest to use during in function calling.
	 * @param {string} id of the function.
	 * @param {string} description of the function.
	 * @param {BaseFunctionTool} parameters or arguments of the function.
	 * @returns {FunctionDefinition} An object of the function manifest.
	 */
	public generateFunctionManifest(
		id: string = this.id,
		description: string = this.desc,
		parameters: AgentFuncInterface = this._parameters
	): FunctionDefinition {
		// return cache if it exists.
		// Initialize an array to hold keys of required properties
		const requiredProperties = [];

		// Iterate over each property in the parameters
		for (const key in parameters.properties) {
			const property =
				parameters.properties[
					key.toLowerCase() as keyof typeof parameters.properties
				];
			// Check if the property is required
			if (property.required === true) {
				// Add key to the required properties array
				requiredProperties.push(key);
				// Remove the 'required' field from the property
				delete property.required;
			}
		}

		// Return the modified manifest
		return {
			name: id,
			description: description,
			parameters: {
				type: "object",
				...parameters,
				required: requiredProperties,
			},
		};
	}

	/**
	 * Executes the function.
	 * @param {...any} args
	 * @returns {any} The result of the function.
	 */
	public async execute(actor: ActorClass, context: Message[], args: object): Promise<string> {
		throw new Error("Execute method not implemented");
	}

	public async check(...args: any): Promise<boolean> {
		return true;
	}
}

/** Types */

export interface BasePropertyInterface {
	type: "string" | "number" | "boolean" | "object" | "array";
	required?: boolean;
	description: string;
}

export type NestedPropertyTypes =
	| Omit<BooleanPropertyType, "description">
	| Omit<NumberPropertyType, "description">
	| Omit<StringPropertyType, "description">
	| Omit<ObjectPropertyType, "description">
	| Omit<ArrayPropertyType, "description">;

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

export type PropertyTypes =
	| BooleanPropertyType
	| NumberPropertyType
	| StringPropertyType
	| ObjectPropertyType
	| ArrayPropertyType;

export interface AgentFuncInterface extends Record<string, unknown> {
	properties: Record<Lowercase<string>, PropertyTypes>;
}
