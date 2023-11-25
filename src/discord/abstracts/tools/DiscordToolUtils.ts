// author = shokkunn

import { ChannelType, Client, Message, User } from "discord.js";
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
        if (!await tool.check(client, message)) throw new DiscordToolError("check");
        // global tool permissions (cooldowns, global blacklists, etc.)
        if (CooldownManager.isOnCooldown(message.author.id, tool.id)) throw new DiscordToolError("cooldown");
        else CooldownManager.setCooldown(message.author.id, tool.id, tool.rateLimit);
        // if the user is in the groups, then they can use the tool.
        if (tool.options.permissions.roles && tool.options.permissions?.roles.length > 0) {
            // check if the user has a role.
            const member = await message.guild?.members.fetch(message.author.id);
            if (member) {
                const roles = member.roles.cache.map((role) => role.id);
                if (tool.options.permissions.roles.some((role) => roles.includes(role))) return true;
                else throw new DiscordToolError("role_specific");
            } else throw new DiscordToolError("guild_only");
        }
        // if the user is in the users, then they can use the tool.
        if (tool.options.permissions.users && tool.options.permissions.users.length > 0) {
            if (tool.options.permissions.users.includes(message.author.id)) return true;
            else throw new DiscordToolError("user_specific");
        }
        // channel specific (normal channels / categories) [optional]
        if (tool.options.permissions.channels && tool.options.permissions.channels.length > 0) {
            // get parentId of channel
            const parentId = message.channel.type == ChannelType.GuildText ? message.channel.parentId : null;
            // either their parent id is in the list, or their channel id is in the list.
            if (tool.options.permissions.channels.includes(parentId!) 
                || tool.options.permissions.channels.includes(message.channel.id)) return true;
            else throw new DiscordToolError("channel_specific");
        }
        // owner only [optional]
        if (tool.options.permissions?.ownerOnly) {
            if (message.author.id == (await client.application?.fetch())?.owner?.id) return true;
            else throw new DiscordToolError("owner_only");
        }
        // TODO: global blacklists
        return true;
    }
}