// author = shokkunn

import winston from "winston";
import { createClient } from 'redis';

export const redis = createClient({
    "url": process.env.REDIS_URL
})

redis.connect();

redis.on("error", (e) => {
    winston.error(`(REDIS) ${e.message}`)
})
