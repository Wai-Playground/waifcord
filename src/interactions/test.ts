import { ChatInputApplicationCommandData, ChatInputCommandInteraction } from "discord.js";
import SlashCommandClass from "../structs/discord/interactions/SlashCommand";
import CustomClient from "../structs/discord/client/Client";
import StageRunnerClass from "../structs/stage/stages/StageRunner";

export default class Test extends SlashCommandClass {
    constructor() {
        super("bing", "test");
    }

    public async execute(client: CustomClient, interaction: ChatInputCommandInteraction) {
        console.time("fetchActiveWords")
        if (StageRunnerClass.activeWords.size === 0) {
            console.log(await StageRunnerClass.fetchActiveWords())
        } else console.log(StageRunnerClass.activeWords)
        console.timeEnd("fetchActiveWords")
    }
}