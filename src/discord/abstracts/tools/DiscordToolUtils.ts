// author = shokkunn

import { Client, Message, User } from "discord.js";
import DiscordTool from "./DiscordTool";
import CustomClient from "../client/Client";
import CooldownManager from "./cooldown_handler/CoolDowns";

export class DiscordToolError extends Error {
    constructor(message: string) {
        super(message)
        this.name = "DiscordToolError";
    }
}

export default class DiscordToolUtils {
    static async checkToolPermissions(tool: DiscordTool, client: Client, message: Message) {
        // individual tool permissions (tool.check function)
        if (!await tool.check(client, message)) throw new DiscordToolError("You do not have permission to use this tool.");
        // global tool permissions (cooldowns, global blacklists, etc.)
        if (CooldownManager.isOnCooldown(message.author.id, tool.id)) throw new DiscordToolError("You are on cooldown.");
        else CooldownManager.setCooldown(message.author.id, tool.id, tool.rateLimit);
        // if the user is in the groups, then they can use the tool.
        if (tool.options.permissions.roles.length > 0) {
            // check if the user has a role.
            const member = await message.guild?.members.fetch(message.author.id);
            if (member) {
                const roles = member.roles.cache.map((role) => role.id);
                if (tool.options.permissions.roles.some((role) => roles.includes(role))) return true;
                else throw new DiscordToolError("You do not have permission to use this tool.");
            } else throw new DiscordToolError("You are not in the server.");
        }
        // if the user is in the users, then they can use the tool.
        if (tool.options.permissions.users.length > 0) {
            if (tool.options.permissions.users.includes(message.author.id)) return true;
            else throw new DiscordToolError("You do not have permission to use this tool.");
        }
        // TODO: global blacklists, owneronly, etc.
        return true;
    }
}