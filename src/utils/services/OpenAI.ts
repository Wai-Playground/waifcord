// author = shokkunn

import OpenAI from "openai";

if (!Bun.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not found in environment variables");
const OpenAIClient = new OpenAI({
    "apiKey": Bun.env.OPENAI_API_KEY,
})

export default OpenAIClient;