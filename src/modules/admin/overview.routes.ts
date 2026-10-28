import { Router } from 'express';
import { config } from '../../config.js';
import { getNetworkInfo } from '../../network.js';
import { adminOnly } from '../../middleware/admin-only.js';

export const adminRouter = Router();

export interface ActivityEntry {
  ts: string;
  method: string;
  path: string;
  status: number;
  ms: number;
  ip?: string;
}

export const activityBuffer: ActivityEntry[] = [];

export function pushActivity(entry: ActivityEntry): void {
  activityBuffer.push(entry);
  if (activityBuffer.length > 50) activityBuffer.shift();
}

adminRouter.get('/overview', adminOnly, (req, res) => {
  res.json({
    version: config.VERSION,
    env: config.NODE_ENV,
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    network: getNetworkInfo(config.PORT),
    features: config.features,
    modules: [
      { id: 'chat',  name: 'Chat',        icon: '💬', enabled: config.features.chat },
      { id: 'calls', name: 'Voice Calls', icon: '📞', enabled: config.features.calls },
      { id: 'ai',    name: 'AI Engine',   icon: '🧠', enabled: config.features.ai },
      { id: 'audit', name: 'Audit Trail', icon: '📜', enabled: config.features.audit },
    ],
    memory: process.memoryUsage(),
    admin: req.auth,
  });
});

adminRouter.get('/activity', adminOnly, (_req, res) => {
  res.json(activityBuffer.slice(-50).reverse());
});
