import OpenAI from "openai";
import { ChatCompletionCreateParams, ChatCompletionMessage } from "openai/resources/chat/index.mjs";

const client = new OpenAI({
    "apiKey": process.env.OPENAI_API_KEY
})

