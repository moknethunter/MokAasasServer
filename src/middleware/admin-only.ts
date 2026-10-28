import type { RequestHandler } from 'express';
import { ErrorCodes } from '../shared/error-codes.js';
import { COOKIE_NAME } from '../shared/constants.js';
import { verifySession } from '../modules/auth/admin.service.js';

export const adminOnly: RequestHandler = async (req, res, next) => {
  const token = req.cookies?.[COOKIE_NAME] as string | undefined;
  if (!token) return res.status(404).json({ error: 'Not Found', code: ErrorCodes.NOT_FOUND });

  try {
    const payload = await verifySession(token);
    if (!payload || payload.role !== 'admin') {
      return res.status(404).json({ error: 'Not Found', code: ErrorCodes.NOT_FOUND });
    }
    req.auth = { username: payload.sub, role: 'admin' };
    next();
  } catch {
    res.clearCookie(COOKIE_NAME);
    return res.status(404).json({ error: 'Not Found', code: ErrorCodes.NOT_FOUND });
  }
};

export const adminOnlyPage: RequestHandler = async (req, res, next) => {
  const token = req.cookies?.[COOKIE_NAME] as string | undefined;
  if (!token) return res.redirect('/login');

  try {
    const payload = await verifySession(token);
    if (!payload || payload.role !== 'admin') {
      res.clearCookie(COOKIE_NAME);
      return res.redirect('/login');
    }
    req.auth = { username: payload.sub, role: 'admin' };
    next();
  } catch {
    res.clearCookie(COOKIE_NAME);
    return res.redirect('/login');
  }
};
