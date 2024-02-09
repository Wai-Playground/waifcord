// author = shokkunn

import Transport from "winston-transport";
import chalk from "chalk";

export const Levels = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  success: 4,
  debug: 5,
} as const;

export const ColorLevels = {
  fatal: "#FF2D00", //red
  error: "#FF9200", //orange
  warn: "#F1FF38", //yellow
  info: "#3EBFFF", //blue
  success: "#32FF5B", //green
  debug: "#FF1B7C", //magenta
} as const;

export const TruncLevels = {
  fatal: "FATL",
  error: "ERRO",
  warn: "WARN",
  info: "INFO",
  success: "SUSS",
  debug: "DEBG",
} as const;

export type LogInfo = {
  message: string;
  level: keyof typeof Levels;
  timestamp: string;
  [key: string]: any;
};


export default class ConsoleTransport extends Transport {
  constructor(opts: Transport.TransportStreamOptions) {
    super(opts);
  }

  log({ message, level, timestamp, ...rest }: LogInfo, callback: () => void) {
    setImmediate(() => {
      console.log(
        chalk.whiteBright.bold.bgHex(ColorLevels[level])(
          ` ${TruncLevels[level]} `
        ),
        message,
        timestamp ? chalk.gray.dim(timestamp) : ""
      );

      callback();
    });
  }
}