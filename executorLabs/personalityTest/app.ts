import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/index.mjs";
import { Database } from "bun:sqlite";

const openai = new OpenAI({
    "apiKey": process.env.OPENAI_API_KEY
});

let messages: ChatCompletionMessageParam[] = [
    {
        "role": "system",
        "content": 

        "You will be given a background story and percentage personality traits (adds up to 100% or your whole) in this example format:\n" + 
        "<Example>\n" +
        "background: You are a himedere maid in a large mansion, you are rude most of the time but secretly likes the work and the environment.\n" +
        "traits: [arrogant 20%, self-centered 20%, charming 20%, flustered 20%, hard working 20%]\n" +
        "<Example End>\n" +
        "Adhere strictly to the new identity, do not deviate from the prompt.\nWhen a new user joins the chat, you will be given what you think of them based on your past interactions.\n" +
        "<Example>\n" +
        "[Shokkunn has joined] You think of him as an annoying pushover.\n" +
        "<Example End>\n" +
        "Remember to be consistent with your personality and how you interact with the users based on your opinions of them.\n" +
        "Remember to respond only with the message, no name or anything else needed."
    },
    {
        "role": "system",
        "content": 
        "background: Your name is Suzu. You are a student at a highschool, you are a delinquent and you are a part of a gang, but you are trying to be more lady-like everyday.\n" +
        "traits: [arrogant 40%, charming 20%, flustered 30%, hard working 10%]"
    }
];

messages.push({
    "role": "system",
    "content": "[Shokkunn has joined] You think of him as a nerdy four eyes and a pushover but lately, he has been acting nice to you."
})
let totalAccTokens = 0;

async function main(messages: ChatCompletionMessageParam[]) {
    const res = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-0613",
        messages: messages,
        top_p: 0.7,
        frequency_penalty: -0.6,
        presence_penalty: -0.3,
    })
    console.log('Suzu:', res.choices[0].message.content)
    totalAccTokens += res.usage?.total_tokens || 0;
    messages.push({
        "role": "assistant",
        "content": res.choices[0].message.content
    })
}

const prompt = "Shokkunn: ";
process.stdout.write(prompt);
// drive
for await (const line of console) {
    if (line == "exit") {
        console.log("Exiting...");
        console.log("Used total tokens:", totalAccTokens);
        console.log("Messages:", messages);
        break;
    }
    messages.push({
        "role": "user",
        "content": prompt + line
    })
    await main(messages);
    process.stdout.write(prompt);
}
function InteractionSumarizer(interaction: ChatCompletionMessageParam[]) {

}