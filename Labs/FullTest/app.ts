import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/index.mjs";
import { Database } from "bun:sqlite";
import { encode } from "gpt-3-encoder";
import { Channel, ChannelType, Client, Guild, IntentsBitField, Message, MessageType, Webhook, WebhookClient } from "discord.js";
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

class TomoClass implements Tomo {
    id: number;
    name: string;
    personalityArray: Personality[];
    notes: Record<string, any>
    background: string;
    constructor(tomo: Tomo) {
        this.id = tomo.id;
        this.name = tomo.name;
        this.personalityArray = tomo.personalityArray;
        this.notes = tomo.notes;
        this.background = tomo.background;
    }

    async getNotes(userId: number) {
        return this.notes[userId];
    }

    async setNotes(userId: number, notes: Record<string, any>) {
        this.notes[userId] = notes;
    }

    async getPersonality() {
        let personality = this.personalityArray.sort((a, b) => b.value - a.value)[0];
        return personality;
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
discord.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (message.cleanContent.includes(listOfTomoNames)) {
        if (!message.inGuild()) return;
        console.log("Tomo detected")
        // get the tomo's name
        let tomoName = listOfTomoNames.find((name: string) => message.cleanContent.includes(name));
        let tomo = new TomoClass(await DBHelper.getTomoFromName(tomoName));
        await editWebhook(tomo.name, message.channelId);
        whClient?.send("hi")
    }
})

discord.once("ready", async () => {
    console.log("Ready!")
});

discord.login(process.env.BOT_TOKEN);

