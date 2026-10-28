import { Router } from 'express';
import { config } from '../../config.js';

export const healthRouter = Router();

// Liveness — هل العملية حية؟
healthRouter.get('/live', (_req, res) => {
  res.json({ status: 'alive', uptime: Math.floor(process.uptime()) });
});

// Readiness — هل التبعيات جاهزة؟ (المرحلة 0: بلا DB، دائماً ready)
healthRouter.get('/ready', (_req, res) => {
  res.json({
    status: 'ready',
    version: config.VERSION,
    env: config.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// Health كامل (يتوافق مع السابق)
healthRouter.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    version: config.VERSION,
    env: config.NODE_ENV,
    uptime: Math.floor(process.uptime()),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString(),
  });
});
