import { ChannelType, ChatInputApplicationCommandData, ChatInputCommandInteraction, Collection, SlashCommandBuilder } from "discord.js";
import SlashCommandClass from "../../structs/discord/interactions/SlashCommand";
import CustomClient from "../../structs/discord/client/Client";
import StageRunnerClass from "../../structs/stage/stages/StageRunner";
import StageClass from "../../structs/stage/stages/Stage";
import ActorOnStageClass from "../../structs/stage/actors/ActorOnStage";
import ActorClass from "../../structs/stage/actors/Actor";
import { ActorsCol } from "../../utils/services/Mango";

export default class Stage extends SlashCommandClass {
    constructor() {
        super("stage", "stage stuff", new SlashCommandBuilder().addSubcommand((sub) => sub.setName("add_turns").setDescription("add turns").addIntegerOption(opt => opt.setMinValue(1).setDescription("amount of turns to add to each actor").setMaxValue(50).setRequired(true).setName("turns")))
        .addSubcommand((sub) => sub.setName("play").setDescription("play a stage").addIntegerOption(opt => opt.setMinValue(1).setDescription("amount of turns to play").setMaxValue(50).setRequired(true).setName("turns")))
        .addSubcommand((s) => s.setName("generate_summary").setDescription("generate a summary of the stage"))
        .addSubcommand((s) => s.setName("stats").setDescription("get the stats of the stage"))
        );
    }

    public async execute(client: CustomClient, interaction: ChatInputCommandInteraction) {
        return [StageRunnerClass.stages.get(interaction.channelId)]
    }

    public async stats(client: CustomClient, interaction: ChatInputCommandInteraction, stage: StageClass) {
        let ret = "";
        for (const [id, actor] of stage.actorParticipants) {
            ret += `(turns: ${actor.turnsLeft}) [tokens used: ${actor.tokensUsed}] ${actor.actorClass.name}\n`
            
        }

        ret += stage.messages.length + " messages in the buffer.\n"
        ret += stage.summary + "\n"
        ret += stage.isGenerating ? "Stage is currently generating.\n" : "Stage is not generating.\n"
        ret += stage.actorParticipants.size + " actors on stage.\n"
        ret += stage.summaryTokens + " tokens used for summary.\n"

        ret += `Total Tokens Used: ${stage.actorParticipants.reduce((acc, actor) => acc + actor.tokensUsed, 0) + stage.summaryTokens}\n`

        await interaction.reply({ content: ret, ephemeral: true })
    }

    public async play(client: CustomClient, interaction: ChatInputCommandInteraction, stage: StageClass) {
        /*
        let charsInitAmount: Collection<string, number> = new Collection();
        for (const [id, actor] of stage.actorParticipants) {
            charsInitAmount.set(actor.id.toString(), actor.turnsLeft);
        }*/

        // play the stage for the amount of turns 
        for (let i = 0; i < interaction.options.getInteger("turns", true); i++) {
            if (stage.isGenerating) {
                await interaction.reply({ content: "Stage is currently generating.", ephemeral: true })
                return;
            }
            await stage.sendBuffer()
        }
    }

    public async generate_summary(client: CustomClient, interaction: ChatInputCommandInteraction, stage: StageClass) {
        /*
        await stage.generateSummary()
        let ret = "";
        for (const [id, actor] of stage.actorParticipants) {
            ret += `${actor.actorClass.name}` + actor.summary + "\n"
        }
        //await interaction.reply({ content: ret, ephemeral: true })
        */
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