// author = shokkunn

import {
	APIApplicationCommandOption,
	ApplicationCommandOptionType,
	Awaitable,
	ChatInputCommandInteraction,
	Client,
	SlashCommandBuilder,
	SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";
import BaseModuleClass from "../../base/BaseMod";

export default abstract class SlashCommandClass extends BaseModuleClass {
	private _usage: string[] = [];
	private _data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder;

	constructor(id: string, description: string, data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder) {
        super(id)
        this._data = data;
		// set the slash command desc.
		this._data.setDescription(description);

		// set the usage.
		this._usage = this.setUsage();
	}

    get data() {
        return this._data;
    }

	get usage() {
		return this._usage;
	}

	abstract execute(client: Client, interaction: ChatInputCommandInteraction): Awaitable<void>;

	/**
	 * @name setUsage
	 * @description Sets the usage of the slash command.
	 * @returns {string[]}
	 */
	setUsage(): string[] {
		let usageStrings: string[] = [];

		function recurOptionChaser(
			OBJ: APIApplicationCommandOption,
			usageString: string,
			prependString: string
		) {
			if (!OBJ?.type) return usageString;
			let requireOrOptional = ` ${OBJ.required ? "<" : "["}${OBJ.name}${
				OBJ.required ? ">" : "]"
			}`;

			switch (OBJ.type) {
				case ApplicationCommandOptionType.SubcommandGroup:
				case ApplicationCommandOptionType.Subcommand:
					if (OBJ.options && OBJ.options.length > 0) {
						for (let option of OBJ.options)
							recurOptionChaser(
								option,
								requireOrOptional,
								`${prependString} ${OBJ.name}`
							);
					} else usageStrings.push(prependString + " " + OBJ.name);
					break;
				default:
					usageStrings.push(prependString + requireOrOptional);
					break;
			}
		}

		if (this._data.options) {
			for (let option of this._data.options) {
				recurOptionChaser(option.toJSON(), "", `/${this._data.name}`);
			}
		} else {
			usageStrings.push(`/${this._data.name}`);
		}

		return usageStrings;
	}
}
