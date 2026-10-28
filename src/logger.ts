import pino from "pino";
import { config } from "./config.js";

export const logger = config.isDev
  ? pino({
      level: config.LOG_LEVEL,
      transport: {
        target: "pino-pretty",
        options: { colorize: true, translateTime: "HH:MM:ss" },
      },
    })
  : pino({ level: config.LOG_LEVEL });
