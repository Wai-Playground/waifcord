import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/index.mjs";
import { Database } from "bun:sqlite";
import { encode } from "gpt-3-encoder";

const openai = new OpenAI({
    "apiKey": process.env.OPENAI_API_KEY
});

const AIName = "Suzu";
const AIBackground = `background: Your name is ${AIName}. You are popular with the boys and is the class president. You have long black hair and is good at every aspect of highschool life, ranging from academics to sports.\n`

let instruction = "Roleplay with the user, create situations and scenes of rom-coms and slice of life anime."
let AITraits = "[charming 25%, flustered 25%, hard working 25%, caring 25%]";
let usrsum = "A classmate. First time meeting him.";

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
        "Conversation Instruction: " + instruction + "\n" +
        "Remember to be consistent with your personality and how you interact with the users based on your opinions of them. Only respond in dialogue, don't repeat your name like 'suzu: ...'. OPTIONAL: For actions use parenthesis: (eats cake)\n"
}

let messages: ChatCompletionMessageParam[] = [];

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
    }
)

let totalAccTokens = 0;

async function main(messages: ChatCompletionMessageParam[]) {

    const res = await openai.chat.completions.create({
        model: "gpt-4-1106-preview",
        messages: messages,
        temperature: 0.72,
        //top_p: 0.7,
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

const prefix = "Shokkunn (24498): ";
let userjson = {};
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

async function InteractionSummarizer(interaction: ChatCompletionMessageParam[]): Promise<{ conversational_summary?: string, user_summary?: string, edit_user_notes?: string, edit_traits?: string}> {
    interaction.push({
        "content": "user notes: " + JSON.stringify(userjson),
        "role": "system"
    })
    const res = await openai.chat.completions.create({
        model: "gpt-4-1106-preview",
        messages: interaction,
        top_p: 0.7,
        "functions": [{
            "name": "summarize_conversation",
            "parameters": {
                type: "object",
                properties: {
                    "conversational_summary": {
                        "type": "string",
                        "description": "conversational_summary is the summary of important details of the interaction, does not need to be human readable but has to be in first person and in character."
                    },
                    "user_summary": {
                        "type": "string",
                        "description": "user_summary is what you think about the user after the interaction, does not need to be human readable but has to be in first person and in character."
                    },
                    "edit_long_term_user_notes": {
                        "type": "string",
                        "description": "edit important information that you think would be useful of the user for the long term. example: {\"favorite_food\": \"cake\"}"
                    },
                    "edit_traits": {
                        'type': "string",
                        "description": "edit_traits is a list of traits to edit, in the format of \"[trait1 percent%, trait2 percent%, ...]\". Edit freely to your liking based on the interaction."
                    }
                },
                "required": ["conversational_summary", "user_summary", "edit_long_term_user_notes", "edit_traits"]
            },
            "description": "Use this function to summarize the conversation, user's summary or edit your own traits.",
        }],
        function_call: { name: "summarize_conversation" },
        frequency_penalty: 0.6, // -0.4
        presence_penalty: 0.4, // -0.2
    })
    console.log(res.usage)
    res.usage?.total_tokens
    //console.log(JSON.stringify(res.choices[0].message.function_call?.arguments, null, 2))
    const json = JSON.parse(res.choices[0].message.function_call?.arguments || "{}") as { conversational_summary?: string, user_summary?: string, edit_user_notes: string, edit_traits?: string};
    if (json?.conversational_summary) console.log("Conversational Summary: ", json.conversational_summary)
    if (json?.user_summary) console.log("User Summary: ", json.user_summary)
    if (json?.edit_traits) console.log("Edit Traits: ", json.edit_traits)
    if (json?.edit_user_notes) console.log("Edit User Notes: ", json.edit_user_notes)
    userjson = json.edit_user_notes ? JSON.parse(json.edit_user_notes) : userjson;
    return json;
}