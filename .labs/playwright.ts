import OpenAI from "openai";

if (!Bun.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not found in environment variables");

const OpenAIClient = new OpenAI({
    "apiKey": Bun.env.OPENAI_API_KEY,
});

OpenAIClient.chat.completions.create({
    messages: [
        {
            "content": "You will be given a current running transcript of a roleplay session between multiple Large Language Models and Users. You will then direct each AI towards a goal together or separately based on the conversation and previously generate goals. Respond in this format: "
            + "{\"nameOne\": \"\"}",
            "role": "system"
        },
        {
            "content": "<CHAT_START>Bob: \"Hello Susan\"\nSusan: \"Bob! How are you?!\"\nBob:\"Hey! What would you like to do today?\"<CHAT_END>",
            "role": "user"
        }
    ],
    "model": "gpt-4-0125-preview",
    "response_format": {
        "type": "json_object"
    }
})