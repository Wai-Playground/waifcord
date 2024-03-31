import { Message, User } from "discord.js";
import ActorClass from "../structs/stage/actors/Actor";
import BaseFunctionToolClass from "../structs/stage/tools/BaseFuncTool";

export default class LocationTool extends BaseFunctionToolClass {
    constructor() {
        super("locationTool", "A tool used to get a random location", {
            "properties": {
                
            }
        })
    }
    
    async execute(actor: ActorClass, context: Message<boolean>[]): Promise<string> {
        return "New York, NY, USA"
    }
}