// author = shokkunn

export default class StageUtils {

    /**
     * @name editWebhook
     * @description rewritten Discord API call to edit a webhook since Bun is janky and breaks the original one.
     * @param {string} webhookId to edit
     * @param {object} data {name, channelId, avatar}
     * @param {string} token the bot token, defaults to Bun.env.BOT_TOKEN
     */
    async editWebhook(webhookId: string, data: { name: string, channelId: string, avatar: string }, token: string | undefined = Bun.env.BOT_TOKEN) {
        if (!token) throw new Error("No token provided");
        const url = `https://discord.com/api/webhooks/${webhookId}`;
        let res = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bot ${token}`
            },
            body: JSON.stringify(data)
        })
        if (!res.ok) throw new Error("Error editing webhook data, status code: " + res.status);
    }
}