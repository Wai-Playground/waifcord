// author = shokkunn

import Transport from 'winston-transport';
import chalk from 'chalk';
import { LogInfo, ColorLevels, TruncLevels } from './Utils';

export default class ConsoleTransport extends Transport {
    constructor(opts: Transport.TransportStreamOptions) {
        super(opts);
    }

    log({ message, level, timestamp, ...args }: LogInfo, callback: () => void) {
        setImmediate(() => {
            console.log(chalk.whiteBright.bold.bgHex(ColorLevels[level])(` ${TruncLevels[level]} `),
                        message, 
                        timestamp ? chalk.gray.dim(timestamp) : '');

            callback();
        });
    }
}