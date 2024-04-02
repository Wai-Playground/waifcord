// author = shokkunn

import { BaseInteraction } from "discord.js";
import CustomClient from "../../structs/discord/client/Client";
import DiscordListenerClass from "../../structs/discord/events/Listener";
import winston from "winston";

export default class CommandInteraction extends DiscordListenerClass {
    constructor() {
        super("interactionCreate", {
            event: "interactionCreate",
        });
    }

    public async execute(client: CustomClient, interaction: BaseInteraction) {
        if (!interaction.isCommand()) return;
        
        const command = client.getInteractionHandler().modules.get(interaction.commandName);
        if (!command) return;
        try {
            await client.getInteractionHandler().executeCommand(interaction);
        } catch (error) {
            console.log(error)
            interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
            winston.log("error", `Error executing command: ${error}`)
        }
    }
}