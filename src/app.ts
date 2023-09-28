// author = shokkunn

import winston from 'winston'
import { Levels } from './utils/logging/Winston'
import LogTransport from './utils/logging/Logging'
import BaseToolUtils from './agent/abstracts/tools/BaseToolUtils';
import { AgentFuncInterface, PropertyTypes, NestedPropertyTypes } from './agent/abstracts/tools/BaseTool';

// configure logger
winston.configure({
    "levels": Levels,
    "format": winston.format.combine(
        winston.format.timestamp()),
    transports: new LogTransport({ level: "debug" })
});


// Example test
const testSchemaDeep: PropertyTypes = {
    type: "object",
    "properties": {
        "param1": {
            "type": "object",
            "properties": {
                "param2": {
                    "type": "array",
                    "itemType": {
                        "type": "object",
                        "properties": {
                            "param3": {
                                "type": "number",
                                "max": 10,
                                "min": 2
                            }
                        }
                    }
                }
            }
        }
    },
    "description": "This is a description",
}

const testSchemaFull: AgentFuncInterface = {
    "properties": {
        "param1": {
            "type": "object",
            "description": "This is a description",
            "properties": {
                "param3": {
                    "type": "array",
                    "itemType": {
                        "type": "number",
                        "min": 1,
                        "max": 10
                    }
                }
            }
        }, 
        "param2": {
            "type": "number",
            "description": "This is a description",
            "required": false
        }
    }
}

const valid = BaseToolUtils.validateFuncResponse({
    "param1": {
        "param3": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10]
    }
}, testSchemaFull)

console.log(valid)


