import { ChannelType, ChatInputApplicationCommandData, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import SlashCommandClass from "../../structs/discord/interactions/SlashCommand";
import CustomClient from "../../structs/discord/client/Client";
import StageRunnerClass from "../../structs/stage/stages/StageRunner";
import StageClass from "../../structs/stage/stages/Stage";
import ActorOnStageClass from "../../structs/stage/actors/ActorOnStage";
import ActorClass from "../../structs/stage/actors/Actor";
import { ActorsCol } from "../../utils/services/Mango";
import StageUtilitiesClass from "../../structs/stage/stages/Utilities";

export default class Test extends SlashCommandClass {
    constructor() {
        super("test", "test stuff")
    };

    public async execute(client: CustomClient, interaction: ChatInputCommandInteraction) {
        
    }
}