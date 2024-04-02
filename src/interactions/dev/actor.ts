import { AttachmentBuilder, ChannelType, ChatInputApplicationCommandData, ChatInputCommandInteraction, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import SlashCommandClass from "../../structs/discord/interactions/SlashCommand";
import CustomClient from "../../structs/discord/client/Client";
import StageRunnerClass from "../../structs/stage/stages/StageRunner";
import StageClass from "../../structs/stage/stages/Stage";
import ActorOnStageClass from "../../structs/stage/actors/ActorOnStage";
import ActorClass, { ActorType } from "../../structs/stage/actors/Actor";
import { ActorsCol } from "../../utils/services/Mango";
import { ObjectId } from "mongodb";
import { readActorImageBufferNoExt } from "../../utils/path/AssetsMan";
import fs from "fs/promises";
import { DefaultPaths } from "../../utils/Constants";
import path from "path";
import winston from "winston";
export default class Actor extends SlashCommandClass {
    constructor() {
        super("actor", "actor stuff", new SlashCommandBuilder()
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand((s) => s.setName("generate_placeholder_actor").setDescription("generates a placeholder actor."))
        .addSubcommand((s) => s.setName("actors").setDescription("get all actors."))
        .addSubcommand((s) => s.setName("disable").setDescription("disables an actor. Will only disable new stage runs not currently active.")
            .addStringOption(opt => opt.setName("actor_name").setDescription("actors name"))
            .addStringOption(opt => opt.setName("actor_id").setDescription("actors id"))))
    };

    public async disable(client: CustomClient, interaction: ChatInputCommandInteraction) {
        let name = interaction.options.getString("actor_name");
        let id = interaction.options.getString("actor_id");
        if (!name && !id) {
            await interaction.reply({ content: "No actor name or id provided.", ephemeral: true })
            return;
        }

        let actor = name ? await ActorsCol.findOne({
            name: name
        }) : await ActorsCol.findOne({ _id:  ObjectId.createFromHexString(id as string) });

        if (!actor) {
            await interaction.reply({ content: "Actor not found.", ephemeral: true })
            return;
        }

        await ActorsCol.updateOne({ _id: actor._id }, { $set: { disabled: true } });
    }

    public async generate_placeholder_actor(client: CustomClient, interaction: ChatInputCommandInteraction) {
        let actor: ActorType = {
            _id: new ObjectId(),
            name: "Placeholder Actor",
            wake_words: [],
            personality_prompt: "",
            disabled: false,
            disabled_tools: [],
            model_params: null
        }
        await ActorsCol.insertOne(actor);
        await interaction.reply({ content: "Placeholder actor generated.", ephemeral: true })
    }

    public async actors(client: CustomClient, interaction: ChatInputCommandInteraction) {
        let actors = await ActorsCol.find({}).toArray();
        let ret: EmbedBuilder[] = [];
        let filesRet: AttachmentBuilder[] = [];
        let fullPath: string = 'unknown';
    
        for (const actor of actors) {
            let id = actor._id.toString();
            const files = await fs.readdir(DefaultPaths.avatarsPath);
            const foundFile = files.find(file => path.basename(file, path.extname(file)) === id);
    
            if (foundFile) {
                fullPath = path.join(DefaultPaths.avatarsPath, foundFile);
                filesRet.push(new AttachmentBuilder(fullPath).setName(foundFile)); // Use the actual found file name
            } else {
                winston.error(`Profile Avatar for ${id} not found.`);
                // Handle the missing file scenario appropriately (e.g., skip, use a placeholder, etc.)
            }
            
            ret.push(new EmbedBuilder()
                .setTitle(actor.name + (actor.disabled ? " (Disabled)" : ""))
                .setColor("#2F3136")
                .setThumbnail( (foundFile ? `attachment://${fullPath}` : client.user?.displayAvatarURL()) || null)
                .addFields([
                    { name: "ID", value: id, inline: true },
                    { name: "Wake Words", value: actor.wake_words.join(", ") || "Not set...?", inline: true },
                    { name: "Disabled", value: actor.disabled ? "Yes" : "No", inline: true },
                    { name: "Model Params", value: actor.model_params ? JSON.stringify(actor.model_params) : "Default", inline: true },
                    { name: "Personality Prompt", value: (actor.personality_prompt.length <= 1024 ? actor.personality_prompt : actor.personality_prompt.slice(0, 1020) + "...") || "Unknown", inline: true }
                ]));
        }
    
        await interaction.reply({ embeds: ret, ephemeral: true, files: filesRet.length == 0 ? undefined : filesRet});
    }

    public async execute(client: CustomClient, interaction: ChatInputCommandInteraction) {        
    }
}