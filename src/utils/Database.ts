// author = shokkunn

import { Database } from "bun:sqlite";
import winston from "winston";

export default class DatabaseUtils {
    static db = new Database("./assets/database.db");

    static setUpSQLITEStrings = {
        settings: `
        CREATE TABLE IF NOT EXISTS bot_settings 
        (   
            SettingID INTEGER PRIMARY KEY,
            LTMEnabled BOOLEAN NOT NULL,
            logMessages BOOLEAN NOT NULL,
            WebhookId TEXT NOT NULL,
            WebhookToken TEXT NOT NULL
        )
        `,
        users: `
        CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY UNIQUE, name TEXT NOT NULL, blacklisted BOOLEAN NOT NULL, updated_at DATE NOT NULL)
        `,
        // id = stage Id, user_id = user Id, message = message, sent_at = date
        messages: `
        CREATE TABLE IF NOT EXISTS messages (id TEXT PRIMARY KEY UNIQUE, user_id TEXT NOT NULL, FOREIGN KEY (user_id) REFERENCES users(id), channel_id TEXT NOT NULL, message TEXT, sent_at DATE NOT NULL)
        `,
        agents: `
        CREATE TABLE IF NOT EXISTS agents (id TEXT PRIMARY KEY UNIQUE, name TEXT NOT NULL, desc TEXT NOT NULL, personalityJSON TEXT NOT NULL, created_by TEXT NOT NULL, created_at DATE NOT NULL, updated_at DATE NOT NULL)
        `
    }

    static setUpSqliteDatabase() {
        // flatten the object and execute each sql statement
        for (const [key, value] of Object.entries(this.setUpSQLITEStrings)) {
            try {
                winston.log("info", `Setting up ${key} table...`);
                this.db.exec(value);
            } catch (e) {
                throw e;
            }
        }
    }
}
