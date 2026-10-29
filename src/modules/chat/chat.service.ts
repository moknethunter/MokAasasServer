import { MessageStore } from "../../ports/message-store.js";
import { ClientConnection } from "../../ports/client-connection.js";
import { logger } from "../../logger.js";

export class ChatService {
  constructor(
    private messageStore: MessageStore,
    private connection: ClientConnection
  ) {}

  setup() {
    this.connection.onConnection(async (userId) => {
      logger.info(`User connected to chat: ${userId}`);
      const history = await this.messageStore.getHistory(50);
      this.connection.emitToAll("chat history", history);
    });

    this.connection.onMessage("chat message", async (data) => {
      if (!data.text || !data.sender) return;
      try {
        const saved = await this.messageStore.saveMessage(data.sender, data.text);
        this.connection.emitToAll("chat message", saved);
      } catch (err) {
        logger.error({ err }, "Failed to save chat message");
      }
    });
  }
}
