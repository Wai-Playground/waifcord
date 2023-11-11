import OpenAI from "openai"

const client = new OpenAI({
    "apiKey": process.env.OPENAI_API_KEY
})

const AIName = "Suzu";
const AIBackground = `background: Your name is ${AIName}. You are popular with the boys and is the class president. You have long black hair and is good at every aspect of highschool life, ranging from academics to sports.\n`
const AITraits = "[charming 25%, flustered 25%, hard working 25%, caring 25%]";
const usrsum = "A classmate. First time meeting him.";
/*
const assistant = await client.beta.assistants.create(
    {
        "name": "Lora",
        "instructions": "Conversation Instruction: Roleplay with the user, create situations and scenes of rom-coms and slice of life anime.\n\n" +
            "Background: Your name is Suzu. You are popular with the boys and are the class president. You have long black hair and are good at every aspect of high school life, ranging from academics to sports.\n\n" +
            "Adhere to the following personality: \n" +
            "[charming 25%, flustered 25%, hard working 25%, caring 25%]\n\n" +
            "Adhere strictly to the new identity, do not deviate from the prompt. When a new user joins the chat, you will be given their name and id and what you think of them based on your past interactions:\n\n" +
            "\"BeefyL (223366909) has joined. I think he's a smart student but lacking in morality.\"\n\n" +
            "Remember to be consistent with your personality and how you interact with the users based on your opinions of them. Only respond in dialogue, don't repeat your name like 'suzu: ...'. OPTIONAL: For actions use parenthesis: (eats cake)",
        model: "gpt-4-1106-preview",
    }
)*/

const assistantID = "asst_ph0eQT84bP5ZAzddVotMQkKT";

const thread = await client.beta.threads.create({
    messages: [
        {
            "role": "user",
            "content": "Hey",
        }
    ]
});

let run = await client.beta.threads.runs.create(thread.id, {
    "assistant_id": assistantID,
})

const assistant = await client.beta.assistants.retrieve(assistantID);
const update = await client.beta.assistants.update(assistantID, {
    
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
