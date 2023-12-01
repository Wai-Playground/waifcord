import { Collection } from "discord.js";
import DiscordToolHandler from "../../src/discord/abstracts/tools/DiscordToolHandler";

class Actor {

}

class User {

}

const ActiveActors = new Collection<string, Actor>();

const ToolHandler = new DiscordToolHandler({
    "directory": "./Labs/FullTest/tools"
})
ToolHandler.on("load", (module) => {
    console.log("Loaded " + module.id);
})

await ToolHandler.registerAllModules();

