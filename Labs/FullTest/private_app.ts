import OpenAI from "openai";
import { ChatCompletion, ChatCompletionMessageParam } from "openai/resources/chat/index.mjs";
import { Database } from "bun:sqlite";
import { encode } from "gpt-3-encoder";
import { Channel, ChannelType, Client, Guild, IntentsBitField, Message, MessageType, User, Webhook, WebhookClient } from "discord.js";
import { toLower } from "lodash";
const dbDir = __dirname + "/tomoDb.json";
const dbfile = Bun.file(dbDir);
if (!await dbfile.exists()) {
    await Bun.write(dbDir, JSON.stringify({
        "users": [],
        "tomo": []
    }));
}

let db = await dbfile.json()

const constantVars = {
    serverID: "943554754670370866",
    webhookID: Bun.env.WEBHOOK_ID || "me",
    webhookTOKEN: Bun.env.WEBHOOK_TOKEN || "u",
}

const webhookClient = new WebhookClient({
    "id": constantVars.webhookID,
    "token": constantVars.webhookTOKEN
})

console.log(constantVars)

// types

interface InternalUser {
    id: string;
    name: string;
}

interface Personality {
    type: string,
    value: number,
}

interface Thread {
    id: string,
    name: string,
    summarizationCap: number,
    messages: ChatCompletionMessageParam[],
}

interface Tomo {
    id: number,
    name: string,
    personalityArray: Personality[],
    notes: {
        // this is a map of the user id to the notes
        [key: string]: {
            description: string
            [key: string]: any
        }
    }
    background: string,
}

const openai = new OpenAI({
    "apiKey": process.env.OPENAI_API_KEY
});

const discord = new Client({
    intents: [
        IntentsBitField.Flags.DirectMessages,
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildPresences,
        IntentsBitField.Flags.GuildWebhooks
    ],
})

const functions: OpenAI.Chat.ChatCompletionCreateParams.Function[] = [

]

// helper class

class DBHelper {
    static async getUser(id: string): Promise<InternalUser> {
        let user = db.users.find((user: InternalUser) => user.id === id);
        if (!user) throw new Error("User not found");
        return user;
    }

    static async getTomo(id: number): Promise<Tomo> {
        let tomo = db.tomo.find((tomo: Tomo) => tomo.id === id);
        if (!tomo) throw new Error("Tomo not found");
        return tomo;
    }

    static async getTomoFromName(name: string): Promise<Tomo> {
        let tomo = db.tomo.find((tomo: Tomo) => tomo.name === name);
        if (!tomo) throw new Error("Tomo not found");
        return tomo;
    }

    static async getTomoFromID(id: number): Promise<Tomo> {
        let tomo = db.tomo.find((tomo: Tomo) => tomo.id === id);
        if (!tomo) throw new Error("Tomo not found");
        return tomo;
    }

    static async updateTomo(id: number, tomo: Tomo) {
        let index = db.tomo.findIndex((tomo: Tomo) => tomo.id === id);
        if (index < 0) throw new Error("Tomo not found");
        db.tomo[index] = tomo;
    }

    // inserts
    static async insertUser(user: InternalUser) {
        // check if user already exists
        let userCheck = db.users.find((user: InternalUser) => user.id === user.id);
        if (userCheck) throw new Error("User already exists");
        db.users.push(user);
    }

    static async insertTomo(tomo: Tomo) {
        // check if tomo already exists
        let tomoCheck = db.tomo.find((tomo: Tomo) => tomo.name === tomo.name);
        if (tomoCheck) throw new Error("Tomo already exists");
        db.tomo.push(tomo);
    }

    static async updateUser(id: string, user: InternalUser) {
        let index = db.users.findIndex((user: InternalUser) => user.id === id);
        if (index < 0) throw new Error("User not found");
        db.users[index] = user;
    }

    static async save() {
        await Bun.write(dbDir, JSON.stringify(db));
    }
}

// structs

class UserClass implements InternalUser {
    id: string;
    name: string;
    constructor(user: InternalUser) {
        this.id = user.id;
        this.name = user.name;
    }

    async save() {
        await DBHelper.updateUser(this.id, {
            id: this.id,
            name: this.name,
        });
    }
}

class ThreadClass implements Thread {
    id: string;
    name: string;
    summarizationCap: number;
    webhookClient: WebhookClient;
    messages: ChatCompletionMessageParam[];
    constructor(thread: Thread, webhookClient: WebhookClient) {
        this.id = thread.id;
        this.name = thread.name;
        this.summarizationCap = thread.summarizationCap;
        this.messages = thread.messages;
        this.webhookClient = webhookClient;
    }

    setWebhookClient(webhookClient: WebhookClient) {
        this.webhookClient = webhookClient;
    }

    checkIfUserFirstTime(userId: string) {
        // check if the user is in this thread.
        if (this.messages.find((message: ChatCompletionMessageParam) => typeof message?.content == "string" && message?.content?.includes(userId))) return false;
    }
}

class TomoClass implements Tomo {
    id: number;
    name: string;
    personalityArray: Personality[];
    notes: Record<string, any>
    background: string;
    thread: ThreadClass | null;
    openAi: OpenAI

    constructor(tomo: Tomo) {
        this.id = tomo.id;
        this.name = tomo.name;
        this.personalityArray = tomo.personalityArray;
        this.notes = tomo.notes;
        this.background = tomo.background;
        this.thread = null;
        this.openAi = new OpenAI({
            "apiKey": process.env.OPENAI_API_KEY
        })
    }

    getNotes(userId: string) {
        return this.notes[userId];
    }

    setNotes(userId: string, notes: Record<string, any>) {
        this.notes[userId] = notes;
    }

    addNotes(userId: string, key: string, value: any) {
        this.notes[userId][key] = value;
    }

    getUserDesc(userId: string) {
        return this.notes[userId].description;
    }

    async save() {
        try {
            await DBHelper.updateTomo(this.id, {
                id: this.id,
                name: this.name,
                personalityArray: this.personalityArray,
                notes: this.notes,
                background: this.background,
            });
        } catch (e) {
            console.log(e);
        }
    }

    get personality() {
        // return as a array like string: [charming 50%, flustered 50%, ...]
        return this.personalityArray.map((personality: Personality) => `${personality.type} ${personality.value * 100}%`);
    }

    async respond(context: Message<boolean>) {
        if (!this.thread) throw new Error("Thread not found");

        if (this.thread.messages.length == 0) {
            this.thread.messages.push({
                "role": "system",
                "content": "Conversation Instruction: Roleplay with the user, create situations and scenes of rom-coms and slice of life anime.\n\n" +
                    "Background:" + this.background + "\n" +
                    "Adhere to the following personality: \n" +
                    `[${this.personality}]\n\n` +
                    "Adhere strictly to the new identity, do not deviate from the prompt. When a new user joins the chat, you will be given their name and id and what you think of them based on your past interactions:\n\n" +
                    "\"BeefyL (random UUID) has joined. I think he's a smart student but lacking in morality.\"\n\n" +
                    "Remember to be consistent with your personality and how you interact with the users based on your opinions of them. Only respond in dialogue, don't repeat your name like 'suzu: ...'. OPTIONAL: For actions use parenthesis: (eats cake)",
            })
        }

        if (this.thread.checkIfUserFirstTime(context.author.id)) {
            if (!this.getNotes(context.author.id)) {
                this.thread.messages.push({
                    "role": "system",
                    "content": `[${context.author.username} (${context.author.id}) has joined] [Unknown user, ask for more information].`
                })

            } else {
                this.thread.messages.push({
                    "role": "system",
                    "content": `[${context.author.username} (${context.author.id}) has joined] ${this.getUserDesc(context.author.id)}`
                })
            }
        }
        // prep the thread.
        this.thread.messages.push({
            "role": "user",
            "content": `${context.author.username} (${context.author.id}): ${context.cleanContent}`
        })

        console.log(this.thread.messages)

        const res = await this.openAi.chat.completions.create({
            model: "gpt-4-1106-preview",
            messages: this.thread.messages,
            temperature: 0.72,
            frequency_penalty: 0.6,
            presence_penalty: 0.4,
        })

        this.thread.messages.push({
            "role": "assistant",
            "content": res.choices[0].message.content
        })

        // send the message
        await this.thread.webhookClient.send({
            content: res.choices[0].message.content ?? "...",
        })
    }
}

async function firstTimeSetup() {
    await DBHelper.insertTomo({ "id": 0, "name": "suzu", "personalityArray": [{ "type": "confident", "value": 0.25 }, { "type": "charming", "value": 0.25 }, { "type": "hard working", "value": 0.25 }, { "type": "caring", "value": 0.25 }], "notes": {}, "background": "Your name is Suzu. You are popular with the boys and is the class president. You have long black hair and is good at every aspect of highschool life, ranging from academics to sports." });
    await DBHelper.save()
}

// start of main
if (db.tomo.length === 0) {
    await firstTimeSetup();
}

let listOfTomoNames = db.tomo.map((tomo: Tomo) => toLower(tomo.name));

async function editWebhook(name: string, channel: string) {
    const url = `https://discord.com/api/webhooks/${constantVars.webhookID}`;
    let resp = await fetch(url, {
        method: 'PATCH',
        'headers': {
            'Content-Type': 'application/json',
            'Authorization': `Bot ${Bun.env.BOT_TOKEN}`
        },
        body: JSON.stringify({
            name: name,
            channel_id: channel
        })
    })
    if (!resp.ok) throw new Error("Error editing webhook name, status code: " + resp.status);
}

async function getWebhook() {
    return new WebhookClient({
        "id": constantVars.webhookID,
        "token": constantVars.webhookTOKEN
    })
}

let whClient: WebhookClient | undefined = await getWebhook();

let activeTomos: TomoClass[] = [];
discord.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (message.cleanContent.includes(listOfTomoNames)) {
        if (!message.inGuild()) return;
        console.log("Tomo detected")
        // get the tomo's name
        let tomoName = listOfTomoNames.find((name: string) => message.cleanContent.includes(name));
        if (message.channel.type !== ChannelType.GuildText) return;

        let tomo = activeTomos.find((tomo: TomoClass) => tomo.id === tomo.id) ?? new TomoClass(await DBHelper.getTomoFromName(tomoName));

        if (!tomo.thread) {
            let thread = new ThreadClass({
                id: message.channelId,
                name: message.channel.name,
                summarizationCap: 10,
                messages: []
            }, whClient ?? await getWebhook());
            tomo.thread = thread;
        }

        if ((await discord.fetchWebhook(constantVars.webhookID)).channelId !== message.channelId) {
            console.log("Webhook channel is not the same as message channel")
            await editWebhook(tomo.name, message.channelId);
        }

        await tomo.respond(message);
    }
})

discord.once("ready", async () => {
    console.log("Ready!")
});

discord.login(process.env.BOT_TOKEN);