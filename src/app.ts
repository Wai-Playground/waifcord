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
                    "type": "object",
                    "properties": {
                        "param4": {
                            "type": "object",
                            "properties": {
                                "param5": {
                                    "type": "string"
                                }
                            },
                            "required": true
                        }
                    }
                }
            }
        }, 
        "param2": {
            "type": "number",
            "description": "This is a description",
            "min": 0,
            "max": 10,
            "required": false
        }
    }
}

const valid = BaseToolUtils.validateFuncResponse({
    "param1": {
        "param3": {
            "param4": {
                "param5": 1
            }
        },
    },
    "param2": 10
}, testSchemaFull)

console.log(valid)


