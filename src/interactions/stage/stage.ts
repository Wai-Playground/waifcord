import { ChannelType, ChatInputApplicationCommandData, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import SlashCommandClass from "../../structs/discord/interactions/SlashCommand";
import CustomClient from "../../structs/discord/client/Client";
import StageRunnerClass from "../../structs/stage/stages/StageRunner";
import StageClass from "../../structs/stage/stages/Stage";
import ActorOnStageClass from "../../structs/stage/actors/ActorOnStage";
import ActorClass from "../../structs/stage/actors/Actor";
import { ActorsCol } from "../../utils/services/Mango";

export default class Stage extends SlashCommandClass {
    constructor() {
        super("stage", "stage stuff", new SlashCommandBuilder().addSubcommand((sub) => sub.setName("add_turns").setDescription("add turns").addIntegerOption(opt => opt.setMinValue(1).setDescription("amount of turns to add to each actor").setMaxValue(10).setRequired(true).setName("turns")))
        .addSubcommand((sub) => sub.setName("play").setDescription("play a stage").addIntegerOption(opt => opt.setMinValue(1).setDescription("amount of turns to play").setMaxValue(10).setRequired(true).setName("turns")))
        );
    }

    public async execute(client: CustomClient, interaction: ChatInputCommandInteraction) {
        return [StageRunnerClass.stages.get(interaction.channelId)]
    }

    public async play(client: CustomClient, interaction: ChatInputCommandInteraction, stage: StageClass) {
        await stage.sendBuffer();
    }

    public async add_turns(client: CustomClient, interaction: ChatInputCommandInteraction, stage: StageClass) {
        let ret = ""
        for (const [id, actor] of stage.actorParticipants) {
            actor.turnsLeft += interaction.options.getInteger("turns", true);
            ret += `${actor.actorClass.name} now has ${actor.turnsLeft} turns left.\n`
        }

        await interaction.reply({ content: ret, ephemeral: true })
    }
}