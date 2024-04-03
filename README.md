# 😊 WaifCord (Multi Character Chat Bot) v0.1 Alpha

    A Bun, Discord.js bot using OpenAI's API & MongoDB to create a multi character & user chat experience.

[Image here]
## 🥰 Features

<p align="center">
The bot is in very early development stage so there will be a ton of bugs! Join my Discord to follow with the updates and try out the bot!
<br>
Edit hte link later*
<a href="Later" target="_blank" ><img src="https://i.imgur.com/px8SRaB.png" width="42" height="32"></a>
</p>

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
- Save tokens by having a summarization context window, for every n messages sent, it will summarize the important parts of the conversation and delete the messages to save on token costs. Ideally the general context shouldn't be lost but more granular details might.
5. **Character Memories ➖ (disabled/testing)**
- Characters will be given past conversations & memories of the users for better personalized context.

## 🔧 Installation & Usage

The bot will require bun to run, please [install](https://bun.sh/docs/installation) it to ensure full compatibility. 

Current versions only require a MongoDB server. You can fully manage it or use MongoDB Atlas's free tier (recommended). Below is a video on how to setup the bot. Written instructions further below.

[Video here]

1. Spin up a new MongoDB database, whether in your own local machine or a managed cloud with MongoDB Atlas.
2. Create new Discord Application & new Bot profile.
3. Make sure you give the bot full admin perms or at the very least permissions pertaining to webhook creation, interactions.update, message read. 
4. Create the ``.env`` file from the ``.env.template`` (detailed explanation there)
5. Run ``bun i`` to install the dependencies.
6. Run ``bun .`` to start the bot.


(Since I use the term actors for the 'characters' I'll use them here.)

### 🧑 Adding Actors to DB

Currently it's quite manual to add new actors since we will be directly editing the MongoDB database. But I created a small command that should help.

1. Use the ``/actor generate_placeholder_actor`` command.
2. There should now be a dummy data in the db.
3. You can use Mongodb Compass, if hosted on a local machine or use the web interface with atlas, to edit the data. It should be easy to understand what each field does.
4. Save the new edits and there should now be a new actor for you to enjoy.

### 💤 Wake Words

Wake words are how the bot decides which actor to add to the stage. There can be multiple of the same wake words across actors. You just say the wake word of an actor and the actor will be added to the stage.

### 🔁 Turns & Priority 

Turns and Priorities are how the stage decide which actor gets to respond. They are both properties of an actor. A turn is an integer and a priority is a flag. The priority flag is set when the user calls any of the actor's wake words or names.

The way the bot decides who goes next is by checking if there is a priority actor and if not, then it'll get the actor with the most turns. The bot will **NEVER** choose an actor who had just been selected a turn before.

Turns are subtracted from the actor after they send the message.

Turns are added to the actor when a user sends a message.

Turns can be manually added with the ``/stage add_turns x`` commands to give everyone an x amount of turns.

### 🎨 Set custom profile picture to Actors 
This is quite obtuse and will be changed later.* Please try to use the webp format since we will be uploading these to Discord for the webhooks.

1. Get the id of the actor you want to edit. 
2. In the ``./assets/avatars/`` folder, place your image (png, jpeg, webp[!!Preferred!!]).
3. Name the image the id of the actor (example: ``65d42233770b35469c89ac6f.webp``).
4. Use the ``/actor actors`` command to check if it worked.
5. On next stage creation, the update should be in effect.

### Misc

### 📝 Todo

- Long Term Memory storage using Redis & VSS module. ❌
- Tool Usage ➖ In Testing/Disabled*
- Character Memory ➖ In Testing
- Better UI for actor and stage management ❌

### Tools*
Tools don't work well with multiple characters at the moment so it has been disabled. Might have to abandon the tool angle as I originally planned this to be a roleplay focussed application instead of a multi agentic one.

## Tips & Tricks

### GPT-4 vs GPT-4-Turbo 
I learned that gpt-4-turbo doesn't really do well with roleplays as well as gpt-4. It seems to talk 'like' the character but not 'as' the character. I encourage you to play around with the prompts and engage with me in Discord if you find ways to make it talk more natural. I imagine this is due to certain character dialogues being removed from the training data? OR this could just be a prompting difference with the two models, I'm not sure.

### Webhooks
We are beholden to Discord's webhook limit per channel so be careful! The bot will NEVER delete webhooks other than it's own. 

### Permissions
The default permissions for all commands(2) should be for roles that has the ``Manage Guild`` permission. Anyone else can not access it.

### Final Words

Thanks for reading, let me know on my Discord server if there's any problems or if you have any new fun bot ideas for me to build. My priority right now is completing the memory portion of the bot. ✅

Author - *Shokkunn / Wai Hlaing*
#### Psst 💬
I'm also searching for an internship so if this project piqued your interest, DM me on my LinkedIn or socials (Find out more on my Main Github account: https://github.com/Jupiternerd)