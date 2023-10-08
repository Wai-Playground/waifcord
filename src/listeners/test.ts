// author = shokkunn

import BaseFunctionTool from "../agent/abstracts/tools/BaseTool";
import BaseModule from "../base/BaseModule";

export default class TestModule extends BaseFunctionTool {
    constructor() {
        super("test", "test", {
            "properties": {
                "test": {
                    "description": "test",
                    "type": "string"
                }
            }
        });
    }
}