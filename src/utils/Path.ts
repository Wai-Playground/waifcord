// author = shokkunn
import fs from 'fs';
import * as path from 'path';

export const projectRoot = path.dirname(Bun.main);

export async function loadFilesFromDirectory(dirPath: string, callback: Function, filter: Function = async () => true): Promise<void> {
    try {
        for (let file of fs.readdirSync(dirPath)) {
            let fPath = path.join(dirPath, file);
            if (fs.statSync(fPath).isDirectory()) {
                await loadFilesFromDirectory(fPath, callback, filter);
            } else {
                if (await filter(file)) {
                    await callback(fPath);
                }
            }
        }
    } catch (error) {
        throw error;
    }
}