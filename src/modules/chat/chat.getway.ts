import { Server } from "socket.io";
import { ChatService } from "./chat.service.js";
import { logger } from "../../logger.js";

export function setupChatGateway(io: Server) {
  const chatService = new ChatService();

  io.on("connection", async (socket) => {
    logger.info(`New connection: ${socket.id}`);

    try {
      const history = await chatService.getHistory();
      socket.emit("chat history", history);
    } catch (err) {
      logger.error("Failed to load history");
    }

    socket.on("chat message", async (data) => {
      try {
        const savedMsg = await chatService.saveMessage(data.sender, data.text);
        io.emit("chat message", savedMsg);
      } catch (err) {
        logger.error("Failed to save message");
      }
    });
  });
}
