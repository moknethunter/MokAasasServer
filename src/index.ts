import http from 'node:http';
import { PrismaClient } from '@prisma/client';
import qrcode from 'qrcode-terminal';
import { config } from './config.js';
import { logger } from './logger.js';
import { getNetworkInfo } from './network.js';
import { createApp } from './app.js';
import { MemorySessionStore } from './adapters/session/memory.js';
import { PostgresUserRepo } from './adapters/users/postgres.js';
import { WebSocketConnection } from './adapters/connection/ws.js';
import { LocalEventBus } from './adapters/events/local.js';
import { setSessionStore } from './modules/auth/admin.service.js';

// ═══════════════════════════════════════════════════
//  Composition Root — المكان الوحيد الذي يعرف كل شيء
// ═══════════════════════════════════════════════════
const prisma = new PrismaClient();
const sessionStore = new MemorySessionStore();          // ← استبدل بـ Redis في المرحلة 2
const userRepo = new PostgresUserRepo(prisma);          // ← ثابت
const eventBus = new LocalEventBus();                    // ← استبدل بـ Redis في المرحلة 2

setSessionStore(sessionStore);

const app = createApp();
const httpServer = http.createServer(app);

const connection = new WebSocketConnection(httpServer);  // ← جاهز للمرحلة 1
connection.start(httpServer);

// ═══════════════════════════════════════════════════
//  Graceful Shutdown
// ═══════════════════════════════════════════════════
async function shutdown(signal: string): Promise<void> {
  logger.info(`${signal} — shutting down`);
  httpServer.close();
  await connection.close();
  await eventBus.close();
  await prisma.$disconnect();
  process.exit(0);
}

for (const sig of ['SIGINT', 'SIGTERM'] as const) {
  process.on(sig, () => void shutdown(sig));
}

// ═══════════════════════════════════════════════════
//  Listen
// ═══════════════════════════════════════════════════
httpServer.listen(config.PORT, config.HOST, () => {
  const urls = getNetworkInfo(config.PORT);
  logger.info(`🚀 Voice Server v${config.VERSION} [${config.NODE_ENV}]`);
  logger.info('─'.repeat(50));
  for (const { label, url } of urls) {
    logger.info(`${label.padEnd(18)} ${url}`);
  }

  const lanUrl = urls[1]?.url;
  if (lanUrl) {
    logger.info('─'.repeat(50));
    logger.info(`📱 امسح من هاتفك: ${lanUrl}`);
    qrcode.generate(lanUrl, { small: true }, (qr) => console.log(qr));
  }

  logger.info('─'.repeat(50));
  logger.info(`Features: ${JSON.stringify(config.features)}`);
});

// references صريحة لتفادي noUnusedLocals
export { userRepo, eventBus };
