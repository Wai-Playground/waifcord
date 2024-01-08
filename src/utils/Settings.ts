// author = shokkunn

import {BotSettings} from "@prisma/client";
import { prisma } from "./Database";
import winston from "winston";

const DEFAULT_SETTINGS: BotSettings = {
    id: 0,
    ownerId: null,
    OAImoderation: false,
    profilePicture: null,
    updatedAt: new Date(),
};

let _settings: BotSettings | null = null;

export async function settings() {
    try {
        if (_settings) return _settings;
        _settings = await prisma.botSettings.findFirst({
            where: {
                id: DEFAULT_SETTINGS.id
            }
        });
        if (!_settings) _settings = await updateSettings(DEFAULT_SETTINGS);
        return _settings;
    } catch (e) {
        winston.error(e);
        throw e;
    }
}

export async function updateSettings(settings: Partial<BotSettings>) {
    try {
        _settings = await prisma.botSettings.upsert({
            where: { id: DEFAULT_SETTINGS.id },
            update: settings,
            create: DEFAULT_SETTINGS
        });
        return _settings;
    } catch (e) {
        winston.error(e);
        throw e;
    }
}