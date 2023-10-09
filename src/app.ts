// author = shokkunn

import winston from 'winston'
import { Levels } from './utils/logging/Winston'
import LogTransport from './utils/logging/Logging'
import BaseToolUtils from './agent/abstracts/tools/BaseToolUtils';
import { AgentFuncInterface, PropertyTypes, NestedPropertyTypes } from './agent/abstracts/tools/BaseTool';
import OpenAI from 'openai';
import BaseModule from './base/BaseModule';
import BaseHandler from './base/BaseHandler';
import { test } from './utils/Database';
import BaseToolHandler from './agent/abstracts/tools/BaseToolHandler';
import { projectRoot } from './utils/Path';

// configure logger
winston.configure({
    "levels": Levels,
    "format": winston.format.combine(
        winston.format.timestamp()),
    transports: new LogTransport({ level: "debug" })
});

/*
const openai = new OpenAI({
    "apiKey": process.env.OPENAI_API_KEY
});
*/

// test

const testHandler = new BaseToolHandler({
    "directory": import.meta.dir + "/listeners",
    "extensions": [".ts", ".js"],
    "bypassRateLimit": false
})

testHandler.on("load", (module: BaseModule) => {
    winston.info(`Loaded module ${module.id}`);
});

testHandler.on("unload", (module: BaseModule) => {
    winston.info(`Unloaded module ${module.id}`);
});

testHandler.on("reload", (module: BaseModule) => {
    winston.warn(`Reloaded module ${module.id}`);
});

await testHandler.loadAllModules();

console.log( testHandler.modules.get("test")?.deregister())
