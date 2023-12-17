// author = shokkunn

import { SchemaFieldTypes, VectorAlgorithms } from "redis";
import { redis } from "../utils/Database";
import winston from "winston";

export default class LTMUtils {
    static async validateRedisHealth() {
        try {
            await redis.ft.create('waifcord-ltm-messages', {
                vector: {
                    type: SchemaFieldTypes.VECTOR,
                    ALGORITHM: VectorAlgorithms.HNSW,
                    TYPE: 'FLOAT32',
                    DIM: 1536,
                    DISTANCE_METRIC: 'COSINE'
                },
                timestamp: {
                    type: SchemaFieldTypes.NUMERIC
                },
                session: {
                    type: SchemaFieldTypes.TAG
                },
                author: {
                    type: SchemaFieldTypes.TAG
                },
                message: {
                    type: SchemaFieldTypes.TEXT
                }
            }, {
                ON: 'HASH',
                PREFIX: 'ltm:messages'
            });
            winston.log("info", "Redis Index created successfully.")
        } catch (e: any) {
            if (e.message === 'Index already exists') {
                winston.log("warn", 'Redis Index exists already, skipped creation.');
            } else {
                winston.log("error", `Redis Index creation failed: ${e.message}. Please make sure RediSearch is installed.`);
                process.exit(1);
            }
        }
    }
}