// author = shokkunn
import fs from 'fs/promises';
import * as path from 'path';
import winston from 'winston';
import { RichError } from './ErrorHandling';


export const projectRoot = path.dirname(Bun.main);

export async function loadFilesFromDirectory(dirPath: string, callback: Function, filter: Function = async () => true): Promise<void> {
    try {
        for (let file of await fs.readdir(dirPath)) {
            let fPath = path.join(dirPath, file);
            if ((await fs.stat(fPath)).isDirectory()) {
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

export async function readAgentImageBufferNoExt(uuid: string, dir: string = 'assets/avatars'): Promise<Buffer | null> {
    try {
        const imageExtensions = ['png', 'jpg', 'jpeg', 'webp'];
        const foundFile = (await fs.readdir(dir)).find((file) => {
          const [fileUUID, ext] = file.split(".");
          return (
            uuid === fileUUID && imageExtensions.includes(ext.toLowerCase())
          );
        });
        if (!foundFile) throw new Error('No file found');
        return await fs.readFile(path.join(dir, foundFile));

    } catch (error) {
        winston.warn('Error reading image buffer:', error);
        return null;
    }
}