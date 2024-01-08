// author = shokkunn

import winston from "winston";
import AgentsClass from "../agents/Agents";
import { OpenAIClient } from "../../../utils/OpenAI";
import { Guild, Webhook } from "discord.js";
import DiscordToolHandler from "../../discord/tools/DiscordToolHandler";

export class StageError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "StageError";
    }
}

export default class StageUtils {
    static wakeWords: Map<string, string[]> = new Map();

    static readonly pathToToolsDir: string = "src/tools/"

    private static webhook: Webhook | undefined;
    private static readonly webhookURL: string | undefined = Bun.env.WEBHOOK_URL;
    private static toolHandler: DiscordToolHandler | undefined;

    public static splitWebhookURL(webhookURL: string | undefined = this.webhookURL) {
        let id: string, token: string, parts: string[];

        try {
            if (!webhookURL) throw new StageError("WEBHOOK_URL Not provided in dot ENV file");
            parts = webhookURL.split('/');
            id = parts[parts.length - 2];
            token = parts[parts.length - 1];

            return { id, token };
        } catch (error) {
            winston.error("Error splitting webhook URL:", error);
            throw error;
        }
    }

    public static get webhookId() {
        return StageUtils.splitWebhookURL().id;
    }

    public static get webhookToken() {
        return StageUtils.splitWebhookURL().token;
    }

    // Retrieve cached wake words, or refresh if cache is empty
    public static async getWakeWords(): Promise<Map<string, string[]>> {
        try {
            if (StageUtils.wakeWords.size > 0) {
                return StageUtils.wakeWords;
            } else {
                return await StageUtils.pullWakeWords();
            }
        } catch (error) {
            winston.error("Error fetching Agent wake words:", error);
            throw error;
        }
    }

    // Refresh wake words from the AgentsClass and update the cache
    public static async pullWakeWords(): Promise<Map<string, string[]>> {
        try {
            // reset it first
            StageUtils.wakeWords = new Map();
            // get all agents with wake words
            let agentsIdWithWords = await AgentsClass.getAllRawWakeWords();
            // set the wake words per agent
            for (let agents of agentsIdWithWords) 
                StageUtils.wakeWords.set(agents.id, JSON.parse(agents.wakeWords));
            // return the wake words
            return StageUtils.wakeWords;
        } catch (error) {
            winston.error("Error refreshing Agent wake words:", error);
            throw error;
        }
    }

    public static async containsAgentWakeWord(content: string) {
        try {
            const wakeWords = await StageUtils.getWakeWords();
            // TODO: make this more efficient
            return [...new Set(
                Array.from(wakeWords)
                    .filter(([agentId, words]) => words.some(word => content.toLowerCase().includes(word.toLowerCase())))
                    .map(([agentId, _]) => agentId)
            )];
        } catch (error) {
            winston.error("Error checking if message contains Agent wake words:", error);
            throw error;
        }
    }

    public static async handleModeration(content: string) {
        let ret = [];
        try {
            for (const results of (await OpenAIClient.moderations.create({
                "input": content,
            })).results) {
                if (results.flagged) ret.push(results);
            }
        } catch (error) {
            winston.error("Error handling OAI moderation:", error);
            throw error;
        }
        return ret;
    }

    public static async fetchWebhook(guild: Guild, webhookId: string = this.webhookId) {
        try {
            if (this.webhook) return this.webhook;
            // fetch the webhook if it's not cached
            this.webhook = (await guild.fetchWebhooks()).find(wh => wh.id === webhookId);
            if (!this.webhook) throw new StageError("Webhook not found, has it been created? webhook id: " + webhookId);
            return this.webhook;
        } catch (error) {
            winston.error("Error fetching webhook:", error);
            throw error;
        }
    }

    public static async refreshWebhook(guild: Guild, webhookId: string = this.webhookId) {
        try {
            this.webhook = undefined;
            return await this.fetchWebhook(guild, webhookId);
        } catch (error) {
            winston.error("Error refreshing webhook:", error);
            throw error;
        }
    }

    public static async getToolHandler() {
        try {
            // return the tool handler if it's already cached
            if (this.toolHandler) return this.toolHandler;
            // create a new tool handler if it's not cached
            this.toolHandler = new DiscordToolHandler({
                directory: this.pathToToolsDir
            });

            await this.toolHandler.registerAllModules();
            return this.toolHandler;
        } catch (error) {
            winston.error("Error getting tool handler:", error);
            throw error;
        }
    }

    /**
     * @name editWebhook
     * @description rewritten Discord API call to edit a webhook since Bun is janky and breaks the original one.
     * @param {string} webhookId to edit
     * @param {object} body {name, channelId, avatar}
     * @param {string} token the bot token, defaults to Bun.env.BOT_TOKEN
     */
    public static async editWebhook(body: { name: string, channelId: string, avatar: string }, webhookId: string = this.webhookId, token: string | undefined = Bun.env.BOT_TOKEN) {
        if (!token) throw new StageError("No token provided");
        const url = `https://discord.com/api/webhooks/${webhookId}`;
        let res = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bot ${token}`
            },
            body: JSON.stringify(body)
        })
        if (!res.ok) throw new StageError("Error editing webhook data, status code: " + res.status);
    }
}