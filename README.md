# 😊 WaifCord (Multi AI Character Chat Discord Bot)

    A Discord.js bot using OpenAI's API & MongoDB to create a multi character & user chat experience.

[Image here]
## 🥰 Features

1. **Multiple Users & Characters interaction within Discord using webhooks.**
- Using a 'stage' per channel you can have unlimited amount of users and characters interacting with each other. *Be careful of context limits & ramping API costs though!* (Ways to mitigate below)
- Fully automated webhooks system, don't worry about setting it up per character.
- Optimized for roleplaying with multiple characters using a **turn and priority system**.
- Robust character customization system, edit individual character's model settings and prompts.
2. **Message Buffer**
- Debouncing buffer message system for a more natural texting experience.
3. **Command/Listener System.**
- Basic module handling system, you can rip it out, improve it or just use the Stage/Stage Runner parts of the code as you see fit.
4. **Incremental Conversation Summarization**
- Save tokens by having a summarization context window, for every n messages sent, it will summarize the important parts of the conversation to save on token costs.
5. **Character Memories ➖ (disabled/testing)**
- Characters will be given past conversations & memories of the users for better personalized context.

## ⚙ Installation

Current versions only require a MongoDB server. You can fully manage it or use MongoDB Atlas's free tier (recommended). Below is a video on how to setup the bot. Written instructions further below.

[Video here]

**How to Install**

[Process Here]


## 📝 Todo

- Long Term Memory storage using Redis & Vector Search module. ❌
- Tool Usage ➖ In Testing
- Character Memory ➖ In Testing
- Refactor some chunks of the code.

## Tips & Tricks

I learned that gpt-4-turbo doesn't really do well with roleplays as well as gpt-4. It seems to talk 'like' the character but not 'as' the character. I encourage you to play around with the prompts and engage with me in Discord if you find ways to make it talk more natural. I imagine this is due to certain character dialogues being removed from the training data? 