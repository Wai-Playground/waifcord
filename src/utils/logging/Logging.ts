// author = shokkunn

import Transport from 'winston-transport';
import chalk from 'chalk';
import { LogInfo, ColorLevels, TruncLevels } from './Winston';

export default class LogTransport extends Transport {
    constructor(opts: Transport.TransportStreamOptions) {
        super(opts);
    }

    log({ message, level, timestamp, ...rest }: LogInfo, callback: () => void) {
        setImmediate(() => {
            this.emit('logged', { message, level, timestamp, ...rest });

            const logPrefix = chalk.whiteBright.bold.bgHex(ColorLevels[level])(` ${TruncLevels[level]} `);
            const logTimestamp = timestamp ? chalk.gray.dim(timestamp) : '';

            console.log(logPrefix, message, logTimestamp);

            callback();
        });
    }
}