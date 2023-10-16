// author = shokkunn

import { random, uniqueId } from "lodash";
import OpenAI from "openai";
import { ChatCompletionCreateParams, ChatCompletionMessageParam } from "openai/resources/chat/completions.mjs";
import { createClient, SchemaFieldTypes, VectorAlgorithms } from 'redis';

const client = createClient();
await client.connect();

let randUUID = random(100000, false);
let i = 0,
    personality = "background: You are a maid in a large mansion, you are rude most of the time but secretly likes the work and the environment.\n" +
        "traits: [arrogant 20%, self-centered 20%, charming 20%, flustered 20%, hard working 20%]" + "\nRemember to be consistent with your personality and how you interact with the users based on your opinions of them.\n" +
        "Respond only with the message, avoiding the use of names or other identifiers. Do not refer to your own personality type or mention that you are an AI",
    messages: ChatCompletionMessageParam[] = [{
        role: "system",
        "content": personality
    }, {
        role: "system",
        "content": "Past Summary: NONE"
    }],
    pastSummary = "NONE";

// build index
try {
    // Documentation: https://redis.io/docs/stack/search/reference/vectors/
    await client.ft.create('long-term-mem-example-embed-all', {
        context_vector: {
            type: SchemaFieldTypes.VECTOR,
            ALGORITHM: VectorAlgorithms.HNSW,
            TYPE: 'FLOAT32',
            DIM: 1536,
            DISTANCE_METRIC: 'COSINE'
        },
        session: {
            type: SchemaFieldTypes.TEXT
        },
        author: {
            type: SchemaFieldTypes.TEXT
        },
        dateTime: {
            type: SchemaFieldTypes.NUMERIC
        },
        message: {
            type: SchemaFieldTypes.TEXT
        }
    }, {
        ON: 'HASH',
        PREFIX: 'mem:long-term-embed-all'
    });
} catch (e: any) {
    if (e.message === 'Index already exists') {
        console.log('Index exists already, skipped creation.');
    } else {
        // Something went wrong, perhaps RediSearch isn't installed...
        console.error(e);
        process.exit(1);
    }
}


const settings = {
    windowSize: 10
}

const openAiClient = new OpenAI({
    "apiKey": process.env.OPENAI_API_KEY
})

async function embed(strs: string[] | string) {
    return (await openAiClient.embeddings.create({
        "input": strs,
        "model": 'text-embedding-ada-002'
    }))
}

async function summarizeProgressively(newMessages: ChatCompletionMessageParam[] = messages, pastSummary: string = "NONE") {

    const promptMessages: ChatCompletionMessageParam[] = [
        {
            role: "system",
            content: `You will be given a new conversation, add on to the previous summarizations given and return a new summary.\n` +
                "\n<EXAMPLE START>" +
                "Past Summary: \"User asked for the capital of America. Assistant states Washington D.C.\"\nNew Conversation: \"What is the weather like in london?\", Assistant: \"It's currently raining.\" Desired Summary: \"User asked for the capital of America. Assistant states Washington D.C. User then asked about the weather in London. Assistant states that it is currently raining.\"" +
                "\n<EXAMPLE END>"
        },
        {
            role: "user",
            "content": "\nPast Summary:" + pastSummary + "\nNew Conversation: " +
                // new conversations split with \n
                newMessages.map(msg => msg.role + ': ' + msg.content).join("\n")
        }
    ]

    const promptFunction: ChatCompletionCreateParams.Function = {
        "name": "summarize_conversation",
        "description": "Generate a progressive summary of the conversation.",
        "parameters": {
            "type": "object",
            "properties": {
                "summarized_context": {
                    "type": "string",
                    "description": "The progressively summarized conversation."
                }
            },
            "required": ["summarized_context"]
        }
    }

    const res = (await openAiClient.chat.completions.create({
        "messages": promptMessages,
        "model": "gpt-3.5-turbo-0613",
        "functions": [promptFunction],
        "function_call": {
            "name": "summarize_conversation"
        },
        "temperature": 0.2
    }))
    console.log(res.choices[0])
    return JSON.parse(res.choices[0].message.function_call?.arguments || "{}") as { summarized_context: string };
}

async function main(msgs: ChatCompletionMessageParam[] = messages) {
    let resp = await openAiClient.chat.completions.create({
        "messages": msgs,
        "model": "gpt-3.5-turbo-0613",
        //top_p: 0.7,
        temperature: 0.7,
        frequency_penalty: 0.6,
        presence_penalty: 0.4
    })

    msgs.push({
        "role": resp.choices[0].message.role,
        "content": resp.choices[0].message.content
    })

    console.log("AI: " + resp.choices[0].message.content)

    if (msgs.length >= settings.windowSize) {
        // summarize and replace the replaced messages with the summary.
        pastSummary = (await summarizeProgressively(msgs, msgs[1].content!)).summarized_context;
        // replace the messages with the summary
        msgs = [{
            "role": "system",
            "content": personality
        }, {
            "role": "system",
            "content": "Past Summary: " + pastSummary
        }]

        console.log(msgs);
    }

    return msgs;
}

async function search(query: string, amount: number = 5) {
    const results = await client.ft.search('long-term-mem-example-embed-all', '*=>[KNN $AM @context_vector $BLOB AS dist]', {
        PARAMS: {
            BLOB: float32Buffer((await embed(query)).data[0].embedding),
            AM: amount,
        },
        SORTBY: 'dist',
        DIALECT: 2,
        RETURN: ['dist', 'session', 'author', 'dateTime', 'message']
    });

    return results;
}

function float32Buffer(arr: number[]) {
    return Buffer.from(new Float32Array(arr).buffer);
}

/** Saving to Redis, !Embed EVERYTHING! (Long term Memory Test) */

let pref = `[Window Size: ${messages.length}] `;
process.stdout.write(pref);
// drive
for await (const line of console) {
    if (line == "exit") {
        console.log("Exiting...");
        
        break;
    }

    if (line.startsWith("search")) {
        console.log("Searching...");
        console.log(await search(line.split(" ")[1]));
        continue;
    }

    messages.push({
        "role": "user",
        "content": line
    })

    messages = await main(messages);

    i++;
    process.stdout.write(`[Window Size: ${messages.length}] `);
}

await client.quit();
