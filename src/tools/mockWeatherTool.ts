import { Message, User } from "discord.js";
import ActorClass from "../structs/stage/actors/Actor";
import BaseFunctionToolClass from "../structs/stage/tools/BaseFuncTool";

export default class WeatherTool extends BaseFunctionToolClass {
    constructor() {
        super("weatherTool", "A tool used to get the weather of a location", {
            "properties": {
                "location": {
                    "description": "input the requested location",
                    "type": "string"
                }
            }
        })
    }
    
    async execute(actor: ActorClass, context: Message<boolean>[]): Promise<string> {
        return "Sunny, 70 degrees Fahrenheit"
    }
}