// author = shokkunn

import {
	ApplicationCommandOptionType,
	Collection,
	CommandInteraction,
	REST,
	Routes,
} from "discord.js";
import BaseHandler, { BaseHandlerOptions } from "../../base/BaseModHandler";
import SlashCommandClass from "./SlashCommand";
import CustomClient from "../client/Client";

export default class InteractionHandlerClass extends BaseHandler {
	protected declare _modules: Collection<string, SlashCommandClass>;
	protected _client: CustomClient;

	constructor(client: CustomClient, options: BaseHandlerOptions) {
		super(options);
		this._client = client;
	}

	override get modules(): Collection<string, SlashCommandClass> {
		return this._modules;
	}

	/**
	 * @name executeCommand
	 * @description Executes a command.
	 * @param {CommandInteraction} interaction
	 * @returns {Promise<any>}
	 */
	public async executeCommand(interaction: CommandInteraction): Promise<any> {
		let mod = this.modules.get(interaction.commandName);
		try {
			// checks
			if (!mod) throw new Error("Module not found");
			if (!interaction.isChatInputCommand())
				throw new Error("Interaction is not a command");

			let type: ApplicationCommandOptionType =
				interaction.options.data[0]?.type;
			if (
				type == ApplicationCommandOptionType.Subcommand ||
				type == ApplicationCommandOptionType.SubcommandGroup
			) {
				let subCommand =
					mod[interaction.options.getSubcommand() as keyof SlashCommandClass];
				// Check if the subcommand is a function
				if (InteractionHandlerClass.isCallableFunction(subCommand))
					return subCommand(this._client, interaction);
			}

			return mod.execute(this._client, interaction);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @name uploadToDiscord
	 * @desc Uploads the commands to Discord using the REST API.
	 * @param {string} token
	 * @param {string} cliendId
	 * @param {string} guildId optional, determins global or guild upload
	 */
	public async uploadToDiscord(
		token: string,
		cliendId: string,
		guildId?: string
	) {
		const rest = new REST({ version: "9" }).setToken(token);
		try {
			// if guildId is passed, we register the commands to the guild, otherwise we register them globally
			await rest.put(
				guildId
					? Routes.applicationGuildCommands(cliendId, guildId)
					: Routes.applicationCommands(cliendId),
				{
					body: this.modules.map((module) => module.data.toJSON()),
				}
			);
		} catch (error) {
			throw error;
		}
	}

	static isCallableFunction(value: any): value is Function {
		return typeof value === "function";
	}
}
