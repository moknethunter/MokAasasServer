import http from "node:http";
import { Server as SocketIOServer } from "socket.io";
import qrcode from "qrcode-terminal";
import { config } from "./config.js";
import { logger } from "./logger.js";
import { getNetworkInfo } from "./network.js";
import { createApp } from "./app.js";
import { setupChatGateway } from "./modules/chat/chat.gateway.js"; // <- الوحدة الجديدة

const app = createApp();
const server = http.createServer(app);
const io = new SocketIOServer(server, { cors: { origin: "*" } });

// تفعيل وحدة الشات
setupChatGateway(io);

server.listen(config.PORT, config.HOST, () => {
  const urls = getNetworkInfo(config.PORT);
  logger.info(`MokAasasServer v${config.VERSION} [${config.NODE_ENV}]`);
  for (const { label, url } of urls) logger.info(`${label.padEnd(18)} ${url}`);
  const lanUrl = urls[1]?.url;
  if (lanUrl) qrcode.generate(lanUrl, { small: true }, (qr) => console.log(qr));
});
