import { randomUUID } from 'node:crypto';
import type { RequestHandler } from 'express';

export const correlationId: RequestHandler = (req, res, next) => {
  const id = (req.header('x-request-id') ?? randomUUID()).slice(0, 64);
  req.correlationId = id;
  res.setHeader('x-request-id', id);
  next();
};
