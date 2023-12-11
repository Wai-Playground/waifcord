// author = shokkunn

export default class StageUtils {

    /**
     * @name editWebhook
     * @description rewritten Discord API call to edit a webhook since Bun is janky and breaks the original one.
     * @param {string} webhookId to edit
     * @param {object} data {name, channelId, avatar}
     */
    async editWebhook(webhookId: string, data: { name: string, channelId: string, avatar: string }) {
        const url = `https://discord.com/api/webhooks/${webhookId}`;
        let res = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bot ${Bun.env.BOT_TOKEN}`
            },
            body: JSON.stringify(data)
        })
        if (!res.ok) throw new Error("Error editing webhook data, status code: " + res.status);
    }
}