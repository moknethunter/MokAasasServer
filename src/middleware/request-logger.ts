import type { RequestHandler } from "express";
import { logger } from "../logger.js";

export const requestLogger: RequestHandler = (req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    logger.info(`${req.method} ${req.path} ${res.statusCode} ${Date.now() - start}ms`);
  });
  next();
};
