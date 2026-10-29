import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { config } from './config.js';
import { logger } from './logger.js';
import { registry } from './metrics.js';
import { correlationId } from './middleware/correlation.js';
import { requestLogger } from './middleware/request-logger.js';
import { errorHandler } from './middleware/error-handler.js';
import { adminOnlyPage } from './middleware/admin-only.js';
import { healthRouter } from './modules/health/routes.js';
import { authRouter } from './modules/auth/admin.routes.js';
import { createAuthRoutes } from './modules/auth/auth.routes.js';
import { adminRouter, pushActivity } from './modules/admin/overview.routes.js';
import { COOKIE_NAME } from './shared/constants.js';
import { AuthService } from './modules/auth/auth.service.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

export function createApp(authService: AuthService): Express {
  const app = express();

  app.set('trust proxy', 1);
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());
  app.use(correlationId);

  // Activity capture (للوحة التحكم)
  app.use((req, _res, next) => {
    const start = Date.now();
    _res.on('finish', () => {
      if (req.path === '/api/v1/admin/activity') return;
      pushActivity({
        ts: new Date().toISOString(),
        method: req.method,
        path: req.path,
        status: _res.statusCode,
        ms: Date.now() - start,
        ip: req.ip,
      });
    });
    next();
  });

  app.use(requestLogger);

  // API v1 - كل الراوترات هنا
  app.use('/api/v1', healthRouter);
  app.use('/api/v1/auth', authRouter); // القديم
  app.use('/api/auth', createAuthRoutes(authService)); // الجديد بـ AuthService
  app.use('/api/v1/admin', adminRouter);

  // Metrics
  app.get('/metrics', async (_req, res) => {
    res.set('Content-Type', registry.contentType);
    res.send(await registry.metrics());
  });

  // Pages - لا يدخلها إلا المدير
  app.get('/', (req, res) => {
    const hasSession = Boolean((req.cookies as any)?.[COOKIE_NAME]);
    res.redirect(hasSession ? '/dashboard' : '/login');
  });

  app.get('/dashboard', adminOnlyPage, (_req, res) => {
    res.sendFile(join(publicDir, 'dashboard.html'));
  });

  // Static assets
  app.use(express.static(publicDir, { index: false }));

  // 404
  app.use((req, res) => {
    res.status(404).json({ error: 'Not Found', code: 'E2002_NOT_FOUND', path: req.path });
  });

  app.use(errorHandler);

  logger.info(`App created [${config.NODE_ENV}]`);
  return app;
}
