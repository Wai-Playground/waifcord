// author = shokkunn

import winston from "winston";
import { createClient } from 'redis';
import { Prisma, PrismaClient } from "@prisma/client";

// prisma
export const prisma = new PrismaClient({
    "log": [
        {
            "emit": "event",
            "level": "query"
        },
        {
            "emit": "event",
            "level": "info"
        },
        {
            "emit": "event",
            "level": "warn"
        },
        {
            "emit": "event",
            "level": "error"
        }
    ]
});

/** Debug level logging */
prisma.$on("query", (e: Prisma.QueryEvent) => {
    winston.debug(`(PRISMA) ${e.query} ${e.duration}ms`);
});

// redis

export const redis = createClient({
    "url": process.env.REDIS_URL
})

redis.connect();

redis.on("error", (e) => {
    winston.error(`(REDIS) ${e.message}`)
})
