import type { RequestHandler } from 'express';
import { logger } from '../logger.js';
import { httpRequests, httpDuration } from '../metrics.js';

export const requestLogger: RequestHandler = (req, res, next) => {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const durationSec = Number(process.hrtime.bigint() - start) / 1e9;
    const path = req.route?.path ?? req.path;
    httpRequests.inc({ method: req.method, path, status: res.statusCode });
    httpDuration.observe({ method: req.method, path }, durationSec);

    logger.info(
      {
        reqId: req.correlationId,
        method: req.method,
        path: req.path,
        status: res.statusCode,
        ms: Math.round(durationSec * 1000),
      },
      `${req.method} ${req.path} ${res.statusCode}`
    );
  });

  next();
};
