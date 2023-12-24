// author = shokkunn

import { SchemaFieldTypes, VectorAlgorithms } from "redis";
import { redis } from "../utils/Database";
import winston from "winston";
import { v4 as generateUUID } from "uuid";
import { OpenAIClient } from "../utils/OpenAI";

export class LTMError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "LTMError";
    }
}

export default class LTMUtils {
    private static _idx = 'idx:waifcord-ltm-messages';
    private static _prefix = 'ltm:messages';

    static async validateRedisHealth() {
        try {
            await redis.ft.create(this.idx, {
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
                stageId: {
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
                PREFIX: this._prefix 
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

    static get idx() { return LTMUtils._idx; }
    static get prefix() { return LTMUtils._prefix; }

    static float32Buffer(arr: number[]) {
        return Buffer.from(new Float32Array(arr).buffer);
    }

    static async embed(str: string) {
        return await OpenAIClient.embeddings.create({
            "input": str,
            "model": "text-embedding-ada-002"
        })
    }

    static async findSimilarMessages(vector: number[], authors: string[] | string, stageId?: string) {
        let authorsArray = Array.isArray(authors) ? authors : [authors];
        let searchQuery = `(${authorsArray.map(author => `@author:${author}`).join(' | ')})=>[KNN 10 @vector $BLOB AS dist]`;
        if (stageId) searchQuery = `(@stageId:{${stageId}} | ${searchQuery})`;
        
        let res;
        try {
            res = await redis.ft.search(LTMUtils.idx, searchQuery, {
                PARAMS: {
                    BLOB: LTMUtils.float32Buffer(vector)
                },
                SORTBY: 'dist',
                DIALECT: 2,
                RETURN: ['dist', 'author', 'message', 'stageId', 'timestamp']
            });
        } catch (e: any) {
            throw e;
        }
        return res;
    }

    static async storeMessage(vector: number[], author: string, message: string, stageId: string) {
        try {
            await redis.hSet(LTMUtils.prefix + `:${author}:${stageId}:` + generateUUID(),
                { vector: LTMUtils.float32Buffer(vector), author: author, message: message, stageId: stageId, timestamp: Date.now() });
        } catch (e: any) {
            throw e;
        }
    }
}