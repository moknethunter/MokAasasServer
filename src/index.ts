import http from "node:http";
import { Server as SocketIOServer } from "socket.io";
import { PrismaClient } from "@prisma/client";
import qrcode from "qrcode-terminal";
import { config } from "./config.js";
import { logger } from "./logger.js";
import { getNetworkInfo } from "./network.js";
import { createApp } from "./app.js";

const app = createApp();
const server = http.createServer(app);
const prisma = new PrismaClient();

// إعداد Socket.IO
const io = new SocketIOServer(server, {
  cors: { origin: "*" }
});

io.on("connection", (socket) => {
  logger.info(`New connection: ${socket.id}`);
  socket.on("chat message", (data) => {
    io.emit("chat message", data);
  });
});

// ⚡ مسار جديد لجلب الإحصائيات الحية
app.get("/api/v1/admin/stats", async (req, res) => {
  try {
    // 1. عدد المتصلين حالياً عبر Socket.IO
    const activeConnections = io.engine.clientsCount;
    
    // 2. عدد المشتركين في قاعدة البيانات (المستخدمين)
    let totalSubscribers = 0;
    try {
      totalSubscribers = await prisma.user.count();
    } catch (e) {
      // إذا لم تكن قاعدة البيانات متصلة بعد، نتجاهل الخطأ
      totalSubscribers = 1; // على الأقل الأدمن
    }

    res.json({
      activeConnections,
      totalSubscribers,
      uptime: Math.floor(process.uptime()),
      memory: process.memoryUsage(),
      status: "online"
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

server.listen(config.PORT, config.HOST, () => {
  const urls = getNetworkInfo(config.PORT);
  logger.info(`MokAasasServer v${config.VERSION} [${config.NODE_ENV}]`);
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

for (const sig of ["SIGINT", "SIGTERM"] as const) {
  process.on(sig, () => {
    logger.info(`${sig} received, shutting down`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 5000).unref();
  });
}
