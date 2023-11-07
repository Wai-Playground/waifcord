import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/index.mjs";
import { Database } from "bun:sqlite";
import { encode } from "gpt-3-encoder";

const openai = new OpenAI({
    "apiKey": process.env.OPENAI_API_KEY
});

const AIName = "Suzu";
const AIBackground = `background: Your name is ${AIName}. You are a himedere maid in a large mansion, you are rude most of the time but secretly likes the work and the environment. You reply in short curt responses unless it's about work or something you enjoy.\n`

let AITraits = "[self rightious 20%, easily flustered 30%, curt 30%, hard working 20%]";      
let usrsum = "He is the new servant of the mansion.";
let prompt: ChatCompletionMessageParam = {
    "role": "system",
    "content":
        "You will be given a background story and percentage personality traits (adds up to 100%) in this example format:\n" +
        "<Example>\n" +
        "background: You are a himedere maid in a large mansion, you are rude most of the time but secretly likes the work and the environment.\n" +
        "traits: [arrogant 20%, self-centered 20%, charming 20%, flustered 20%, hard working 20%]" +
        "<Example End>\n" +
        "Adhere strictly to the new identity, do not deviate from the prompt.\nWhen a new user joins the chat, you will be given their name and id and what you think of them based on your past interactions.\n" +
        "<Example>\n" +
        "[BeefyL (2298) has joined] You think of him as an annoying pushover.\n" +
        "<Example End>\n" +
        "Remember to be consistent with your personality and how you interact with the users based on your opinions of them.\n"
}

let messages: ChatCompletionMessageParam[] = [
];

messages.push(
    {
        ...prompt
    },
    {
        "role": "system",
        "content": AIBackground + "traits: " + AITraits
    },
    {
        "role": "system",
        "content": "[Shokkunn (24498) has joined] " + usrsum
    })

let totalAccTokens = 0;

async function main(messages: ChatCompletionMessageParam[]) {

    const res = await openai.chat.completions.create({
        model: "gpt-4-1106-preview",
        messages: messages,
        top_p: 0.7,
        frequency_penalty: 0.6,
        presence_penalty: 0.4,
    })
    console.log('Suzu:', res.choices[0].message.content)
    totalAccTokens += res.usage?.total_tokens || 0;
    messages.push({
        "role": "assistant",
        "content": res.choices[0].message.content
    })
}

function reset(summary?: string) {
    messages = [];
    messages.push(
        {
            ...prompt
        },
        {
            "role": "system",
            "content": AIBackground + "traits: "+AITraits
        },
        {
            "role": "system",
            "content": "[Shokkunn (24498) has joined] " + usrsum + "\n [Previous Conversation Summary] " + summary
        })
    console.log(messages)
    
}

const prefix = "Shokkunn (24498):  ";
process.stdout.write(prefix);
// drive
for await (const line of console) {
    if (line == "exit") {
        console.log("Exiting...");
        console.log("Messages:", messages);
        console.log("Used total tokens:", totalAccTokens);
        break;
    }

    if (line == "summarize") {
        const { conversational_summary, user_summary, edit_traits } = await InteractionSummarizer(messages);
        usrsum = user_summary || usrsum;
        AITraits = edit_traits || AITraits;

        reset(conversational_summary)
        process.stdout.write(prefix);
        continue;
    }
    messages.push({
        "role": "user",
        "content": prefix + line
    })
    await main(messages);
    process.stdout.write(prefix);
}


async function InteractionSummarizer(interaction: ChatCompletionMessageParam[]): Promise<{ conversational_summary?: string, user_summary?: string, edit_traits?: string}> {
    const res = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-0613",
        messages: interaction,
        top_p: 0.7,
        "functions": [{
            "name": "summarize_conversation",
            "parameters": {
                type: "object",
                properties: {
                    "conversational_summary": {
                        "type": "string",
                        "description": "conversational_summary is the summary of important details of the interaction, does not need to be human readable."
                    },
                    "user_summary": {
                        "type": "string",
                        "description": "user_summary is what you think about the user after the interaction, does not need to be human readable."
                    },
                    "edit_traits": {
                        'type': "string",
                        "description": "edit_traits is a list of traits to edit, in the format of [trait1 percent%, trait2 percent%, ...], NOT AN ARRAY!"
                    }
                },
                "required": ["conversational_summary", "user_summary"]
            },
            "description": "Use this function to summarize the conversation so far. Be sure to include necessary detail relevent for you to look back and remember the conversation.",
        }],
        function_call: { name: "summarize_conversation"},
        frequency_penalty: -0.4,
        presence_penalty: -0.2,
    })
    console.log(res.usage)
    const json = JSON.parse(res.choices[0].message.function_call?.arguments || "{}") as {conversational_summary?: string, user_summary?: string, edit_traits?: string};
    if (json?.conversational_summary) console.log("Conversational Summary: ", json.conversational_summary)
    if (json?.user_summary) console.log("User Summary: ", json.user_summary)
    if (json?.edit_traits) console.log("Edit Traits: ", json.edit_traits)
    return json;
}