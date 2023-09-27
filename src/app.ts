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
            "type": "array",
            "min": 1,
            "max": 2,
            itemType: {
                "type": "string"
            }
        }
    },
    "description": "This is a description",
}

const testSchemaFull: AgentFuncInterface = {
    "properties": {
        "Param1": {
            "type": "object",
            "description": "This is a description",
            "properties": {
                "Param2": {
                    "type": "array",
                    "itemType": {
                        "type": "number",
                        "min": 1,
                        "max": 10
                    }
                }
            }
        }
    }
}



const isValid = BaseToolUtils.validateProperty({ param1: [6] }, testSchemaDeep);
console.log(isValid);  // should output true


