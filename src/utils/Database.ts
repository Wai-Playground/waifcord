// author = shokkunn

import winston from "winston";
import { createClient, SchemaFieldTypes, VectorAlgorithms } from 'redis';

// redis

export const redis = createClient({
    "url": process.env.REDIS_URL
})

redis.on("error", (e) => {
    winston.error(`(REDIS) ${e.message}`)
})
