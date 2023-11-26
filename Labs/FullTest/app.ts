import { Collection } from "discord.js";

interface UserInterface {
    id: string;   
}

interface Tomo {
    id: string;
    name: string;
    description: string;

}

const Tomodachis = new Collection<string, Tomo>