import http from "node:http";
import qrcode from "qrcode-terminal";
import { config } from "./config.js";
import { logger } from "./logger.js";
import { getNetworkInfo } from "./network.js";
import { createApp } from "./app.js";

// ─── Adapters ───
import { SocketIOAdapter } from "./adapters/connection/socket-io.adapter.js";
import { PrismaMessageAdapter } from "./adapters/storage/prisma-message.adapter.js";
import { PrismaUserAdapter } from "./adapters/storage/prisma-user.adapter.js";
import { BcryptHasherAdapter } from "./adapters/security/bcrypt-hasher.adapter.js";
import { JwtTokenAdapter } from "./adapters/security/jwt-token.adapter.js";

// ─── Modules (Services) ───
import { ChatService } from "./modules/chat/chat.service.js";
import { AuthService } from "./modules/auth/auth.service.js";
import { CallService } from "./modules/calls/call.service.js";

// ═══════════════════════════════════════════════════
//  1. تهيئة التنفيذات (Adapters)
// ═══════════════════════════════════════════════════
const hasher = new BcryptHasherAdapter();
const tokenService = new JwtTokenAdapter();
const userRepo = new PrismaUserAdapter();
const messageStore = new PrismaMessageAdapter();

// ═══════════════════════════════════════════════════
//  2. تهيئة الخدمات (Services / Modules)
// ═══════════════════════════════════════════════════
const authService = new AuthService(userRepo, hasher, tokenService);

// ═══════════════════════════════════════════════════
//  3. تهيئة التطبيق والسيرفر
// ═══════════════════════════════════════════════════
const app = createApp(authService);
const server = http.createServer(app);

const connection = new SocketIOAdapter(tokenService);
connection.start(server);

const chatService = new ChatService(messageStore, connection, userRepo);
chatService.setup();

const callService = new CallService(connection, userRepo);
callService.setup();

// ═══════════════════════════════════════════════════
//  4. تشغيل السيرفر
// ═══════════════════════════════════════════════════
server.listen(config.PORT, config.HOST, () => {
  const urls = getNetworkInfo(config.PORT);
  logger.info(`🚀 MokAsasServer v${config.VERSION} (Telecom Edition)`);
  logger.info("-".repeat(50));
  
  for (const { label, url } of urls) {
    logger.info(`${label.padEnd(18)} ${url}`);
  }
  
  const lanUrl = urls[1]?.url;
  if (lanUrl) {
    logger.info("-".repeat(50));
    logger.info(`📱 Scan from phone: ${lanUrl}`);
    qrcode.generate(lanUrl, { small: true }, (qr) => console.log(qr));
  }
  logger.info("-".repeat(50));
});

// ═══════════════════════════════════════════════════
//  5. الإغلاق الآمن (Graceful Shutdown)
// ═══════════════════════════════════════════════════
for (const sig of ["SIGINT", "SIGTERM"] as const) {
  process.on(sig, () => {
    logger.info(`${sig} received, shutting down`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 5000).unref();
  });
}
