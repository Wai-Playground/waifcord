import OpenAI from "openai"

const client = new OpenAI({
    "apiKey": process.env.OPENAI_API_KEY
})

const assistant = await client.beta.assistants.create(
    {
        "name": "Lora",
        "description": "You are a himedere maid in a mansion.",
        model: "gpt-4-1106-preview"

    }
)

const thread = await client.beta.threads.create({
    messages: [
        {
            "role": "user",
            "content": "Hey",
        }
    ]
});

let run = await client.beta.threads.runs.create(thread.id, {
    "assistant_id": assistant.id,
    "instructions": "You are a himedere maid in a mansion.",
})

while (true) {
    run = await client.beta.threads.runs.retrieve(thread.id, run.id);
    // wait 0.5 seconds before polling again
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(run)
    if (run.status !== 'in_progress') {
        let updated = await client.beta.threads.messages.list(thread.id);
        //console.log(updated)
        console.log(updated.data)
        break;
    }
}
