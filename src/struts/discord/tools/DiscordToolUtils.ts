// author = shokkunn

import { ChannelType, Client, Message } from "discord.js";
import DiscordTool from "./DiscordTool";
import CooldownManager from "../../agent/tools/cooldown_handler/CoolDowns";

export class DiscordToolError extends Error {
    public code: DiscordToolErrorType;
    constructor(code: DiscordToolErrorType) {
        super(code)
        this.code = code;
    }
}

export enum DiscordToolErrorType {
    check = "check",
    cooldown = "cooldown",
    role_specific = "role_specific",
    user_specific = "user_specific",
    channel_specific = "channel_specific",
    owner_only = "owner_only",
    guild_only = "guild_only",
}

export default class DiscordToolUtils {
    static async checkToolPermissions(tool: DiscordTool, client: Client, message: Message) {
        // individual tool permissions (tool.check function)
        if (!await tool.check(client, message)) throw new DiscordToolError(DiscordToolErrorType.check);
        // global tool permissions (cooldowns, global blacklists, etc.)
        if (CooldownManager.isOnCooldown(message.author.id, tool.id)) throw new DiscordToolError(DiscordToolErrorType.cooldown);
        else CooldownManager.setCooldown(message.author.id, tool.id, tool.rateLimit);
        // see if there are any permissions.
        if (!tool.options.permissions) return true;
        // if the user is in the groups, then they can use the tool. [optional]
        if (tool.options.permissions.roles && tool.options.permissions?.roles.length > 0) {
            // check if the user has a role.
            const member = await message.guild?.members.fetch(message.author.id);
            if (member) {
                const roles = member.roles.cache.map((role) => role.id);
                if (tool.options.permissions.roles.some((role) => roles.includes(role))) return true;
                else throw new DiscordToolError(DiscordToolErrorType.role_specific);
            } else throw new DiscordToolError(DiscordToolErrorType.guild_only);
        }
        // if the user is in the users, then they can use the tool. [optional]
        if (tool.options.permissions.users && tool.options.permissions.users.length > 0) {
            if (tool.options.permissions.users.includes(message.author.id)) return true;
            else throw new DiscordToolError(DiscordToolErrorType.user_specific);
        }
        // channel specific (normal channels / categories) [optional]
        if (tool.options.permissions.channels && tool.options.permissions.channels.length > 0) {
            // get parentId of channel
            const parentId = message.channel.type == ChannelType.GuildText ? message.channel.parentId : null;
            // either their parent id is in the list, or their channel id is in the list.
            if (tool.options.permissions.channels.includes(parentId!) 
                || tool.options.permissions.channels.includes(message.channel.id)) return true;
            else throw new DiscordToolError(DiscordToolErrorType.channel_specific);
        }
        // owner only [optional]
        if (tool.options.permissions?.ownerOnly) {
            if (message.author.id == (await client.application?.fetch())?.owner?.id) return true;
            else throw new DiscordToolError(DiscordToolErrorType.owner_only);
        }
        // TODO: global blacklists
        return true;
    }
}