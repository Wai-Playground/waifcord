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

            console.log(chalk.whiteBright.bold.bgHex(ColorLevels[level])(` ${TruncLevels[level]} `),
                        message, 
                        timestamp ? chalk.gray.dim(timestamp) : '');

            callback();
        });
    }
}