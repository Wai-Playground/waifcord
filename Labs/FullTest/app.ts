import { Collection } from "discord.js";

interface UserInterface {
    id: string;   
}

interface Actor {
    id: string;
    name: string;
    description: string;
}

const ActiveActors = new Collection<string, Actor>();
