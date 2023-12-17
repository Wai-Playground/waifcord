// author = shokkunn

import { PrismaClient, Settings, Prisma } from "@prisma/client";
import winston from "winston";
import { createClient, SchemaFieldTypes, VectorAlgorithms } from 'redis';
import { DefaultArgs } from "@prisma/client/runtime/library";

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

/** Settings */
let settings: Settings | null = null;
export async function getSettings() {
    try {
        if (settings == null) {
            settings = await prisma.settings.findFirst({
                "where": {
                    "id": 0
                }
            })
        }
    } catch (e) {
        winston.error(`(PRISMA) Something went wrong while fetching settings.`)
        throw e;
    } finally {
        return settings;
    }
}

export async function saveSettings(data: Settings) {
    settings = data;
    try {
        await prisma.settings.upsert({
            "where": {
                "id": 0
            },
            create: {
                "id": 0,
                "webhookId": "",
                "webhookToken": "",
            },
            update: data
        })
    }
    catch (e) {
        winston.error(`(PRISMA) Something went wrong while saving settings.`)
        throw e;
    }
    finally {
        return settings;
    }
}

/** Debug level logging */
prisma.$on("query", (e: Prisma.QueryEvent) => {
    winston.debug(`(PRISMA) ${e.query} ${e.duration}ms`);
});

// redis

export const redis = createClient({
    "url": process.env.REDIS_URL
})

redis.on("error", (e) => {
    winston.error(`(REDIS) ${e.message}`)
})
