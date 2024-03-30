// author = shokkunn
/** @TODO will migrate to zod for validation, but this will do for now */

import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder, Message, MessageComponentInteraction } from "discord.js";
import { AgentFuncInterface, NestedPropertyTypes, PropertyTypes } from "./BaseFuncTool";

export const TransparentBgHex = "#2F3136";

export default class ToolUtilitiesClass {
	/**
	 * checks if a number is within a range
	 * @param {number} value of the number to check
	 * @param {number} min optional
	 * @param {number} max optional
	 * @returns {boolean}
	 */
	private static withinNumberRange(
		value: number,
		min?: number,
		max?: number
	): boolean {
		return (
			(min === undefined || value >= min) && (max === undefined || value <= max)
		);
	}

	/**
	 * checks if an array is within a range
	 * @param {any[]} arr of the number to check
	 * @param {number} min optional
	 * @param {number} max optional
	 * @returns {boolean}
	 */
	private static withinArrayRange(
		arr: any[],
		min?: number,
		max?: number
	): boolean {
		return (
			(min === undefined || arr.length >= min) &&
			(max === undefined || arr.length <= max)
		);
	}

	/**
	 * Checks if a JSON object is valid against a PropertyTypes or NestedPropertyTypes schema
	 * @param {Record<string, any>} input JSON object to check
	 * @param {PropertyTypes | NestedPropertyTypes} propSchema to check against
	 * @returns
	 */
	public static validateProperty(
		input: Record<string, any>,
		propSchema: PropertyTypes | NestedPropertyTypes
	): boolean {
		// initialize stack
		type StackItemType = {
			input: any;
			propSchema: PropertyTypes | NestedPropertyTypes;
		};
		const stack: StackItemType[] = [{ input, propSchema }];

		while (stack.length > 0) {
			const { input, propSchema } = stack.pop()!;

			switch (propSchema.type) {
				// same checks for string and boolean
				case "string":
				case "boolean":
					if (typeof input !== propSchema.type)
						throw new Error(
							`Expected ${propSchema.type} but got ${typeof input}`
						);
					break;
				case "number":
					// if the input is not a number or is not within the range, return false
					if (typeof input !== "number")
						throw new Error(
							`Expected number but got ${typeof input}`
						);
					if (!this.withinNumberRange(input, propSchema.min, propSchema.max))
						throw new Error(
							`Expected number to be within range [${propSchema.min}, ${propSchema.max}] but got ${input}`
						);
					break;
				case "object":
					// if the input is not an object or is an array, return false
					if (typeof input !== "object" || Array.isArray(input))
						throw new Error(
							`Expected object but got ${typeof input}`
						);
					// loop through each prop in the schema
					for (const [key, secPropSchema] of Object.entries(
						propSchema.properties || {}
					)) {
						// if the prop is required and is not in the input, return false
						if (secPropSchema.required && input[key] === undefined)
							throw new Error(
								`Expected ${key} to be in input`
							);
						// we push the prop into the stack
						if (input[key] !== undefined)
							stack.push({ input: input[key], propSchema: secPropSchema });
					}
					break;
				case "array":
					if (!Array.isArray(input))
						throw new Error(
							`Expected array but got ${typeof input}`
						);
					if (!this.withinArrayRange(input, propSchema.min, propSchema.max))
						throw new Error(
							`Expected array to be within range [${propSchema.min}, ${propSchema.max}] but got ${input}`
						);
					// if the array has an itemType, we push each item into the stack to check
					if (propSchema.itemType)
						for (const item of input)
							stack.push({ input: item, propSchema: propSchema.itemType });
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
	public static validateFuncResponse(
		input: object,
		schema: AgentFuncInterface
	): boolean {
		// Check if every key in input is defined in the schema
		for (const key of Object.keys(input)) {
			if (!schema.properties.hasOwnProperty(key)) {
				throw new Error(`Unrecognized property: ${key}`);
			}
		}

		// loop through each prop in the schema
		for (const key of Object.keys(input)) {
			const propValue = input[key as keyof typeof input];
			const propSchema = schema.properties[key as keyof typeof input];
			// If the prop is required and is not in the input, return false.
			if (propSchema.required && propValue === undefined) return false;
			// If the prop is in the input, validate it.
			if (propValue !== undefined) {
				try {
					this.validateProperty(propValue, propSchema);
				} catch (e) {
					throw e;
				}
			}
		}
		return true;
	}
	
	static embedPage(title: string | null, desc: string | null): EmbedBuilder {
		return new EmbedBuilder()
			.setTitle(title)
			.setColor(TransparentBgHex)
			.setDescription(desc)
			.setTimestamp();
	}


	static async askUserForConfirmation(
		message: Message,
		pages: {
			prompt: { title: string | null; desc: string | null };
			confirm?: { title: string | null; desc: string | null };
			cancel?: { title: string | null; desc: string | null };
			timeout?: { title: string | null; desc: string | null };
		},
		filterBypassUsersId: string[] = [],
		timeout: number = 60000
	): Promise<{
		confirmed: boolean;
		message: Message<boolean> | null;
		timeout: boolean;
	}> {
		const confirmKey = `confirm.${message.author.id}`;
		const cancelKey = `cancel.${message.author.id}`;

		try {
			const promptMessage = await message.reply({
				embeds: [this.embedPage(pages.prompt?.title, pages.prompt?.desc)],
				components: [
					new ActionRowBuilder<ButtonBuilder>().addComponents(
						new ButtonBuilder()
							.setCustomId(confirmKey)
							.setLabel("Confirm")
							.setStyle(ButtonStyle.Success),
						new ButtonBuilder()
							.setCustomId(cancelKey)
							.setLabel("Cancel")
							.setStyle(ButtonStyle.Danger)
					),
				],
				allowedMentions: { repliedUser: false },
			});

			const filter = (interaction: MessageComponentInteraction) => {
				return (
					filterBypassUsersId.includes(interaction.user.id) &&
					(interaction.customId === confirmKey || interaction.customId === cancelKey)
				);
			};

			const collector = promptMessage.createMessageComponentCollector({
				filter,
				time: timeout,
			});

			return new Promise((resolve) => {
				collector.on("collect", async (interaction: ButtonInteraction) => {
					const isConfirm = interaction.customId === confirmKey;
					const page = isConfirm ? pages.confirm : pages.cancel;

					if (promptMessage.editable && page) {
						await interaction.update({
							components: [],
							embeds: [this.embedPage(page.title, page.desc)],
						});
					}

					resolve({ confirmed: isConfirm, message: promptMessage, timeout: false });
				});

				collector.on("end", async (collected, reason) => {
					if (reason === "time") {
						if (promptMessage.editable && pages.timeout) {
							await promptMessage.edit({
								components: [],
								embeds: [
									this.embedPage(pages.timeout.title, pages.timeout.desc),
								],
							});
						} else await promptMessage.delete();

						resolve({ confirmed: false, message: promptMessage, timeout: true });
					}
				});
			});
		} catch (error) {
			throw new Error(
				"Error in ToolUtilities.askUserForConfirmation: " + error
			);
		}
	}
}
