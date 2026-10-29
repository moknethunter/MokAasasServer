import http from "node:http";
import qrcode from "qrcode-terminal";
import { config } from "./config.js";
import { logger } from "./logger.js";
import { getNetworkInfo } from "./network.js";
import { createApp } from "./app.js";

import { SocketIOAdapter } from "./adapters/connection/socket-io.adapter.js";
import { PrismaMessageAdapter } from "./adapters/storage/prisma-message.adapter.js";
import { PrismaUserAdapter } from "./adapters/storage/prisma-user.adapter.js";
import { BcryptHasherAdapter } from "./adapters/security/bcrypt-hasher.adapter.js";
import { JwtTokenAdapter } from "./adapters/security/jwt-token.adapter.js";

import { ChatService } from "./modules/chat/chat.service.js";
import { AuthService } from "./modules/auth/auth.service.js";
import { CallService } from "./modules/calls/call.service.js";

// Adapters & Repos
const hasher = new BcryptHasherAdapter();
const tokenService = new JwtTokenAdapter();
const userRepo = new PrismaUserAdapter();
const messageStore = new PrismaMessageAdapter();

// Services
const authService = new AuthService(userRepo, hasher, tokenService);
const app = createApp(authService);
const server = http.createServer(app);

const connection = new SocketIOAdapter(tokenService);
connection.start(server);

const chatService = new ChatService(messageStore, connection, userRepo);
chatService.setup();

const callService = new CallService(connection, userRepo);
callService.setup();

server.listen(config.PORT, config.HOST, () => {
  const urls = getNetworkInfo(config.PORT);
  logger.info(`MokAsasServer v${config.VERSION} (Telecom Edition)`);
  for (const { label, url } of urls) logger.info(`${label.padEnd(18)} ${url}`);
  const lanUrl = urls[1]?.url;
  if (lanUrl) qrcode.generate(lanUrl, { small: true }, (qr) => console.log(qr));
});
