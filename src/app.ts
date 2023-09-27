// author = shokkunn

import winston from 'winston'
import { Levels } from './utils/logging/Winston'
import LogTransport from './utils/logging/Logging'
import BaseToolUtils from './agent/abstracts/tools/BaseToolUtils';
import { AgentFuncInterface, PropertyTypes, PropertyTypesWithoutDescription } from './agent/abstracts/tools/BaseTool';

// configure logger
winston.configure({
    "levels": Levels,
    "format": winston.format.combine(
        winston.format.timestamp()),
    transports: new LogTransport({ level: "debug" })
});

const testSchema: AgentFuncInterface = {
    "properties": {
        "param1": {
            "type": "array",
            "itemType": {
                "type": "object",
                "properties": {
                    "keyOne": {
                        "type": "object",
                        "properties": {
                            "keyTwo": {
                                "type": "boolean"
                            }
                        }
                    }
                }
            },
            "description": "This is a description",
            "required": true
        },
        "param2": {
            "type": "object",
            "description": "This is a description",
            "properties": {
                "keyOne": {
                    "type": "object",
                    "properties": {
                        "keyTwo": {
                            "type": "number"
                        },
                        "keyThree": {
                            "type": "string"
                        }
                    }
                }
            }
        },
        "param3": {
            "type": "string",
            "description": "This is a description"
        },
        "param4": {
            "type": "boolean",
            "description": "This is a description"
        },
        "param5": {
            "type": "array",
            "itemType": {
                "type": "object",
                "properties": {
                    "keyOne": {
                        "type": "number"
                    }
                }
            },
            "description": "This is a description",
        },
    },
    "type": "object"
}

const testInput = {
    "param1": [true, false, true],
    "param2": {
        "keyOne": {
            "keyTwo": 1,
            "keyThree": "test"
        }
    },
    "param3": "test",
    "param4": true
}


// Example test
const testSchemaDeep: PropertyTypes = {
    type: "object",
    "properties": {
        "param1": {
            "type": "array",
            itemType: {
                "type": "number"
            }
        }
    },
    "description": "This is a description",
}



const isValid = BaseToolUtils.validate({param1: [2]}, testSchemaDeep);
console.log(isValid);  // should output true


