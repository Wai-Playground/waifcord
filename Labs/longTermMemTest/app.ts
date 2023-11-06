import OpenAI from "openai";
import { ChatCompletionCreateParams, ChatCompletionMessage } from "openai/resources/chat/index.mjs";

const client = new OpenAI({
    "apiKey": process.env.OPENAI_API_KEY
})

const testMessages: ChatCompletionMessage[] = [{
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
    "content": "I recall 2 messages two nights ago: \n" + "user: Hey, is the steak ready?\n" + "assistant: Yes, it's ready. Would you like it now?"
},
{
    "role": "user",
    "content": "What did we have for dinner a few nights ago?"
}
]

let resp = await client.chat.completions.create({
    "messages": testMessages,
    "model": "gpt-3.5-turbo-0613",
    //top_p: 0.7,
    temperature: 0.7,
    frequency_penalty: 0.6,
    presence_penalty: 0.4
})

console.log(resp.choices[0])

