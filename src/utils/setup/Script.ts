// author = shokkunn

import { SchemaFieldTypes, VectorAlgorithms } from "redis";
import { redis } from "../Database";
import winston from "winston";
import LTMUtils from "../../memory/LTMUtils";

/**
 * startup script, runs to test if certain modules are installed
 */

await LTMUtils.validateRedisHealth();
