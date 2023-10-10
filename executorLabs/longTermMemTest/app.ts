import OpenAI from "openai";

const openai = new OpenAI({
    "apiKey": process.env.OPENAI_API_KEY
});

//truthy
const truthyC = [
    {
        role: "user",
        content: "hey!"
    }, {
        role: "assistant",
        content: "Oh, it's you. What do you want?"
    }, {
        role: "user",
        content: "I need some help with a geography lesson."
    }, {
        role: "assistant",
        content: "Ugh, fine. What do you need help with?"
    }, {
        role: "user",
        content: "What is the capital of Turkey?"
    }, {
        role: "assistant",
        content: "Can't you look that up yourself? It's Ankara. Now leave me alone."
    }, {
        role: "user",
        content: "Ankara, what does that mean?"
    }, {
        role: "assistant",
        content: "Ankara means \"anchor\" in Turkish. Now, go bother someone else with your questions."
    },
    {
        role: "user",
        content: "You're my ankara to life."
    }, {
        role: "assistant",
        content: "W-what? That's...unexpected. Just focus on your work and stop with these strange compliments."
    },
    {
        role: "user",
        content: "Hahaha, you're pretty cute when you're flustered."
    },
    {
        role: "assistant",
        content: "I-I am not cute! Don't get any strange ideas about me, got it? Now, go back to your duties and stop wasting my time."
    },
    {
        role: "user",
        content: "Righty, cya!"
    }, {
        role: "assistant",
        content: "Finally, he's gone. Good riddance."
    }
]

//dummy
const falsyC = [
    {
        role: "user",
        content: "Hey!"
    }, {
        role: "assistant",
        content: "Hmm, what do you want? Don't bother me unless it's something important."
    },
    {
        role: "user",
        content: "How long have you been working here?"
    }, {
        role: "assistant",
        content: "None of your business! Just know that I've been here longer than you, so show some respect."
    },
    {
        role: "user",
        content: "Sorry!"
    }, {
        role: "assistant",
        content: "Hmph, apology accepted. Just make sure you don't make any more mistakes. Now get back to work!"
    }
]

//dummyTwo
const falsyCTwo = [
    {
        role: "user",
        content: "hey!"
    }, {
        role: "assistant",
        content: "Ugh, another servant? Can't they find anyone competent around here?"
    },
    {
        role: "user",
        content: "how are you?"
    }, {
        role: "assistant",
        content: "Hmph! I'm doing just fine, thank you very much. What do you want?"
    }, {
        role: "user",
        content: "Nothing much, just thinking out loud."
    }
]

const res = await openai.embeddings.create({
    "input": truthyC.map((msg) => msg.content).join("\n"),
    "model": "text-embedding-ada-002",
})

console.log(res.data[0].embedding)