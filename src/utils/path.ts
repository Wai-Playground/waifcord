// author = shokkunn

import * as path from 'path';

const projectRoot = path.dirname(Bun.main);
export function resolveFromRoot(...segments: string[]): string {
    return path.resolve(projectRoot, ...segments);
}