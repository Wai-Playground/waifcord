// author = shokkunn

import {BotSettings} from "@prisma/client";
import { prisma } from "./Database";

let _settings: BotSettings | null = null;

export function settings() {
    if (!_settings) prisma.botSettings.findUnique({ where: { id: 1 } }).then((settings) => _settings = settings);
    return _settings;
}

export async function updateSettings(settings: BotSettings) {
    await prisma.botSettings.upsert({ where: { id: 1 }, update: settings, create: settings });
    _settings = settings;
}