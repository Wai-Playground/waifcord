// author = shokkunn
import fs from "fs/promises";
import * as path from "path";
import winston from "winston";
import { DefaultPaths } from "../Constants";

export const projectRoot = path.dirname(Bun.main);

export async function loadFilesFromDirectory(
  dirPath: string,
  callback: Function,
  filter: Function = async () => true
): Promise<void> {
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

export async function readAgentImageBufferNoExt(
  uuid: string,
  avatarDir = DefaultPaths.avatarsPath
): Promise<Buffer | null> {
  try {
    const imageExtensions = ["png", "jpg", "jpeg", "webp"];
    const foundFile = (await fs.readdir(avatarDir)).find((file) => {
      const [fileUUID, ext] = file.split(".");
      return uuid === fileUUID && imageExtensions.includes(ext.toLowerCase());
    });
    if (!foundFile)
      throw new Error(
        `Profile Avatar for ${uuid} not found.`
      );
    return await fs.readFile(path.join(avatarDir, foundFile));
  } catch (error) {
    winston.warn("Error reading image buffer:", error);
    return null;
  }
}
