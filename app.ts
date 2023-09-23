import OpenAI from "openai";
import { ChatCompletionCreateParams, ChatCompletionMessageParam } from "openai/resources/chat/index.mjs";

const openai = new OpenAI({
    "apiKey": process.env.OPENAI_API_KEY
});

let messages: ChatCompletionMessageParam[] = [
    {
        role: "system",
        "content": "You are a sarcastic tsundere maid."
    }
];

const functions: ChatCompletionCreateParams.Function[] = [
    {
        name: "getTotalUserAmount",
        "description": "Returns the total amount of users in the chat.",
        parameters: {
            "type": "object",
            properties: {}
        }
    },
    {
        name: "getUserInfo",
        "description": "Returns the user\'s information in the chat.",
        parameters: {
            "type": "object",
            "properties": {
                "id": {
                    "type": "integer",
                    "description": "The user\'s id to get information from.",
                    "minimum": 0,
                }
            },
            "required": ["id"]
        }
    },
    {
        name: "totalMessages",
        "description": "Returns the total amount of the messages in the chat (id starts from 0).",
        parameters: {
            "type": "object",
            "properties": {}
        }
    },
    {
        name: "getMessage",
        "description": "Returns the contents of the message with the provided ID.",
        parameters: {
            "type": "object",
            "properties": {
                "id": {
                    "type": "integer",
                    "description": "The message\'s id.",
                    "minimum": 0,
                }
            },
            "required": ["id"]
        }
    },
    {
        name: "findInMessages",
        "description": "Returns the message objects (id, content, user) of the matched messages. (uses array.filter)",
        parameters: {
            "type": "object",
            "properties": {
                "text": {
                    "type": "string",
                    "description": "The text to search for.",
                    "minimum": 0,
                }
            },
            "required": ["text"]
        }
    },
    {
        name: "banUser",
        "description": "Bans the user with the provided ID.",
        parameters: {
            "type": "object",
            "properties": {
                "id": {
                    "type": "integer",
                    "description": "The user\'s id to ban.",
                    "minimum": 0,
                }
            },
            "required": ["id"]
        }
    }
]

const FakeMessageData = [{
    id: 0,
    userId: 1,
    content: "Hello, wassup"
},
{
    id: 1,
    userId: 2,
    content: "Sup bro",
},
{
    id: 2,
    userId: 2,
    content: "I hate you so much btw",
},
{
    id: 3,
    userId: 1,
    content: "Damn, thats pretty mean",
},
{
    id: 4,
    userId: 2,
    content: "Yeah, well too bad! AHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHAHAHAHAH",
}

]

function getTotalUserAmount(): string {
    return "3";
}
function getUserInfo({ id }: { id: number }): string {
    switch (id) {
        case 0: return JSON.stringify({
            name: "Sally",
            mutes: 0,
            kicks: 0,
            messages: null
        })

        case 1: return JSON.stringify({
            name: "Wai",
            mutes: 1,
            kicks: 4,
            messages: [0, 3]
        })

        case 2: return JSON.stringify({
            name: "Bob",
            mutes: 14,
            kicks: 5,
            messages: [1, 2, 4]
        })

        default: return "No Data";
    }
}

function totalMessages(): string {
    return FakeMessageData.length.toString();
}
function getMessage({ id }: { id: number }): string {
    let ret = FakeMessageData.find((msg) => msg.id === id) || "No Data";
    return JSON.stringify(ret);
}
function findInMessages({ text }: { text: string }): string | null {
    return JSON.stringify(FakeMessageData.filter((msg) => msg.content.includes(text)) || null);
}
function banUser({ id }: { id: number }): string {
    return `${id} has been banned.`
}

const availableFunctions = {
    getTotalUserAmount,
    totalMessages,
    getUserInfo,
    getMessage,
    findInMessages,
    banUser,
}

async function main(msgs: ChatCompletionMessageParam[] = messages): Promise<void> {
    if (messages.length > 15) console.log("Too Many Messages!: ", messages);
    console.log("Calling OpenAI API... with messages: ", msgs);
    const res = await openai.chat.completions.create({
        model: "gpt-4-0613",
        "functions": functions,
        messages: msgs,
        function_call: "auto",
        temperature: 0.6
    })
    //console.log("Got response: ", res)

    let response = res.choices[0].message,
        reason = res.choices[0].finish_reason;

    messages.push(response);

    if (reason == "function_call") {
        let func = response.function_call?.name;
        if (func) {
            if (!(func in availableFunctions)) throw new Error(`Function ${func} is not available.`);
            const result = availableFunctions[func as keyof typeof availableFunctions](
                (response.function_call?.arguments ? JSON.parse(response.function_call.arguments)
                                                   : undefined));
            
            messages.push({
                "role": "function",
                "name": func,
                "content": result
            })
        }
        return await main(messages)
    }

    console.log("AI: " + response.content)
}

const prompt = "Me: ";
process.stdout.write(prompt);
for await (const line of console) {
    messages.push({
        "role": "user",
        "content": line
    })
    await main(messages);
    process.stdout.write(prompt);
}