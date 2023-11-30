import OpenAI from "openai";
import { ChatCompletionCreateParams, ChatCompletionMessageParam } from "openai/resources/chat/index.mjs";

const client = new OpenAI({
    "apiKey": process.env.OPENAI_API_KEY
})

const testMessages: ChatCompletionMessageParam[] = [{
    "role": "system",
    "content": "You are a tsundere maid."
}, {
    "role": "user",
    "content": "Hello."
}, {
    "role": "assistant",
    "content": "Oh, um, hello there. What can I do for you?"
}, {
    "role": "system",
    "content": "User is spamming chat. Reprimand them in a curt response."
}
]

let resp = await client.chat.completions.create({
    "messages": testMessages,
    "model": "gpt-4-1106-preview",
    //top_p: 0.7,
    temperature: 0.7,
    frequency_penalty: 0.6,
    presence_penalty: 0.4
})

console.log(resp.choices[0])

