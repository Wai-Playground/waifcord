// author = shokkunn

import { Collection } from "discord.js";
import StageClass from "./Stage";

export default class StageRunnerClass {
    
    public static stages: Collection<string, StageClass> = new Collection();
    // Collection<AgentId, StageId>
    public static activeWords: Collection<string, string> = new Collection();

    
}