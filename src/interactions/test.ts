import { ChannelType, ChatInputApplicationCommandData, ChatInputCommandInteraction } from "discord.js";
import SlashCommandClass from "../structs/discord/interactions/SlashCommand";
import CustomClient from "../structs/discord/client/Client";
import StageRunnerClass from "../structs/stage/stages/StageRunner";
import StageClass from "../structs/stage/stages/Stage";
import ActorOnStageClass from "../structs/stage/actors/ActorOnStage";
import ActorClass from "../structs/stage/actors/Actor";
import { ActorsCol } from "../utils/services/Mango";

export default class Test extends SlashCommandClass {
    constructor() {
        super("bing", "test");
    }

    public async execute(client: CustomClient, interaction: ChatInputCommandInteraction) {
    }
}