import http from "node:http";
import qrcode from "qrcode-terminal";
import { config } from "./config.js";
import { logger } from "./logger.js";
import { getNetworkInfo } from "./network.js";
import { createApp } from "./app.js";

// Adapters
import { SocketIOAdapter } from "./adapters/connection/socket-io.adapter.js";
import { PrismaMessageAdapter } from "./adapters/storage/prisma-message.adapter.js";

// Modules
import { ChatService } from "./modules/chat/chat.service.js";

const app = createApp();
const server = http.createServer(app);

// Dependency Injection
const connection = new SocketIOAdapter();
connection.start(server);

const messageStore = new PrismaMessageAdapter();
const chatService = new ChatService(messageStore, connection);
chatService.setup();

server.listen(config.PORT, config.HOST, () => {
  const urls = getNetworkInfo(config.PORT);
  logger.info(`MokAsasServer v${config.VERSION} (Phase 2)`);
  logger.info("-".repeat(50));
  for (const { label, url } of urls) {
    logger.info(`${label.padEnd(18)} ${url}`);
  }
  const lanUrl = urls[1]?.url;
  if (lanUrl) {
    logger.info("-".repeat(50));
    logger.info(`Scan from phone: ${lanUrl}`);
    qrcode.generate(lanUrl, { small: true }, (qr) => console.log(qr));
  }
});
