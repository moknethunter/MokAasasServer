import type { ErrorRequestHandler } from 'express';
import { AppError } from '../errors.js';
import { ErrorCodes } from '../shared/error-codes.js';
import { logger } from '../logger.js';

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const isApp = err instanceof AppError;
  const status = isApp ? err.status : 500;
  const code = isApp ? err.code : ErrorCodes.INTERNAL;

  logger.error(
    {
      reqId: req.correlationId,
      err: { message: err?.message, code, stack: err?.stack },
    },
    'Request failed'
  );

  res.status(status).json({
    error: isApp ? err.message : 'Internal Server Error',
    code,
    requestId: req.correlationId,
  });
};
