import DiscordTool from "../../../../src/struts/discord/abstracts/tools/DiscordTool";

export default class TestModule extends DiscordTool {
    constructor() {
        super("test", "test", {
            "properties": {
                "test": {
                    "description": "test",
                    "type": "string"
                }
            }
        }, {
            "requireConfirmation": false
        });
    }

    override async execute(client: any, message: any, ...args: any): Promise<any> {
        return "test";
    }
}