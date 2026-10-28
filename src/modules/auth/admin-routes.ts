import { Router } from 'express';
import { rateLimit } from '../../middleware/rate-limit.js';
import { RATE_LIMITS, COOKIE_NAME } from '../../shared/constants.js';
import { loginSchema } from '../../shared/validators.js';
import { verifyCredentials, issueSession, revokeSession, cookieOptions } from './admin.service.js';
import { adminOnly } from '../../middleware/admin-only.js';
import { logger } from '../../logger.js';
import { AppError } from '../../errors.js';
import { ErrorCodes } from '../../shared/error-codes.js';

export const authRouter = Router();

authRouter.post('/login', rateLimit(RATE_LIMITS.LOGIN), async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError('Invalid input', ErrorCodes.INVALID_INPUT, 400);
    }
    const { username, password } = parsed.data;

    const ok = await verifyCredentials(username, password);
    if (!ok) {
      logger.warn({ ip: req.ip, username }, 'Failed admin login');
      return res.status(401).json({
        error: 'Invalid credentials',
        code: ErrorCodes.AUTH_FAILED,
      });
    }

    const { token } = await issueSession(username);
    res.cookie(COOKIE_NAME, token, cookieOptions);
    logger.info({ ip: req.ip, username }, 'Admin login success');
    res.json({ ok: true, redirect: '/dashboard' });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/logout', adminOnly, async (req, res, next) => {
  try {
    const token = req.cookies?.[COOKIE_NAME] as string | undefined;
    if (token) await revokeSession(token);
    res.clearCookie(COOKIE_NAME);
    logger.info({ user: req.auth?.username }, 'Admin logout');
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

authRouter.get('/me', adminOnly, (req, res) => {
  res.json(req.auth);
});
