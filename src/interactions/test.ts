import { ChatInputApplicationCommandData, ChatInputCommandInteraction } from "discord.js";
import SlashCommandClass from "../structs/discord/interactions/SlashCommand";
import CustomClient from "../structs/discord/client/Client";

export default class Test extends SlashCommandClass {
    constructor() {
        super("bing", "test");
    }

    public async execute(client: CustomClient, interaction: ChatInputCommandInteraction) {
        return interaction.reply("Test command executed!");
    }
}