import { Message, User } from "discord.js";
import ActorClass from "../structs/stage/actors/Actor";
import BaseFunctionToolClass from "../structs/stage/tools/BaseFuncTool";

export default class TestTool extends BaseFunctionToolClass {
    constructor() {
        super("testTool", "Test Tool", {
            "properties": {
                "test": {
                    "description": "input the user's name",
                    "type": "string"
                }
            }
        })
    }
    
    async execute(actor: ActorClass, context: Message<boolean>[]): Promise<string> {
        return "testTool executed"
    }
}