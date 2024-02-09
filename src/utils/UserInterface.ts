import {
	Client,
	Message,
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	MessageComponentInteraction,
	ButtonInteraction,
	CommandInteraction,
} from "discord.js";
import { RichError } from "./ErrorHandling";

export class UserInterface {
	static readonly kaoMoji = [
		"￣へ￣",
		"(#｀-_ゝ-)",
		"(ಥ _ ಥ)",
		"≧ ﹏ ≦",
		"<( ‵□′)>───Ｃε(┬﹏┬)3",
		"╰(艹皿艹 )",
		"o(≧口≦)o",
		"ヽ（≧□≦）ノ",
	];

	static isolateTimeStamp(inputString: string) {
		const timestampRegex = /<t:\d+:R>/g,
			timestamps = inputString.match(timestampRegex) || [],
			wrappedParts = inputString
				.split(timestampRegex)
				.map((part) => (part.trim() ? `\`\`${part.trim()}\`\`` : ""));

		let result = "";
		for (let i = 0; i < wrappedParts.length; i++) {
			result += wrappedParts[i];
			if (i < timestamps.length) {
				result += ` ${timestamps[i]} `;
			}
		}
		return result;
	}

	static embedPage(title: string | null, desc: string | null): EmbedBuilder {
		return new EmbedBuilder()
      .setTitle(title)
      .setColor("#2F3136")
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
				embeds: [UserInterface.embedPage(pages.prompt?.title, pages.prompt?.desc)],
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
					interaction.user.id === message.author.id &&
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
							embeds: [UserInterface.embedPage(page.title, page.desc)],
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
									UserInterface.embedPage(pages.timeout.title, pages.timeout.desc),
								],
							});
						} else await promptMessage.delete();

						resolve({ confirmed: false, message: promptMessage, timeout: true });
					}
				});
			});
		} catch (error) {
			throw error;
		}
	}
}
