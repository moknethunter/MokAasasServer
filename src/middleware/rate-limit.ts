import type { RequestHandler } from 'express';
import { ErrorCodes } from '../shared/error-codes.js';
import { RATE_LIMITS } from '../shared/constants.js';

interface Bucket {
  count: number;
  reset: number;
}

const buckets = new Map<string, Bucket>();

export function rateLimit(opts: { max?: number; windowMs?: number } = {}): RequestHandler {
  const max = opts.max ?? RATE_LIMITS.DEFAULT.max;
  const windowMs = opts.windowMs ?? RATE_LIMITS.DEFAULT.windowMs;

  return (req, res, next) => {
    const key = `${req.ip}:${req.path}`;
    const now = Date.now();
    const bucket = buckets.get(key) ?? { count: 0, reset: now + windowMs };

    if (now > bucket.reset) {
      bucket.count = 0;
      bucket.reset = now + windowMs;
    }

    bucket.count += 1;
    buckets.set(key, bucket);

    if (bucket.count > max) {
      const retry = Math.ceil((bucket.reset - now) / 1000);
      res.setHeader('Retry-After', String(retry));
      return res.status(429).json({
        error: 'Too many attempts',
        code: ErrorCodes.AUTH_RATE_LIMITED,
        retryAfter: retry,
      });
    }
    next();
  };
}

// تنظيف دوري
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of buckets) if (now > v.reset) buckets.delete(k);
}, 60_000).unref();
