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
import { healthRouter } from './modules/health/routes.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

export function createApp(): Express {
  const app = express();

  app.set('trust proxy', 1);
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());
  app.use(correlationId);
  app.use(requestLogger);

  // Health (live + ready + metrics)
  app.use('/api/v1', healthRouter);

  // Metrics endpoint (Prometheus)
  app.get('/metrics', async (_req, res) => {
    res.set('Content-Type', registry.contentType);
    res.send(await registry.metrics());
  });

  // Static assets (no index fallback — صفحات محمية صراحة)
  app.use(express.static(publicDir, { index: false }));

  // 404
  app.use((req, res) => {
    res.status(404).json({ error: 'Not Found', code: 'E2002_NOT_FOUND', path: req.path });
  });

  app.use(errorHandler);

  logger.info(`App created [${config.NODE_ENV}]`);
  return app;
}
