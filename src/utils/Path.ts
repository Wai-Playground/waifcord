// author = shokkunn
import fs from 'fs';
import * as path from 'path';

export const projectRoot = path.dirname(Bun.main);

export async function loadFilesFromDirectory(path: string, callback: Function, filter: Function = async () => { return true }): Promise<void> {
    // drive through the files in the directory.
    try {
        for (let file of fs.readdirSync(path)) {
            let fPath = path + '/' + file;
            // if the file is a directory.
            if (fs.statSync(fPath).isDirectory()) {
                // see this function again.
                await loadFilesFromDirectory(path + file + "/", callback, filter);
            } else {
                // if the file matches the filter, we return the callback.
                if (filter(file)) await callback(fPath);
            }
        }
    } catch (error) {
        throw error;
    }
}