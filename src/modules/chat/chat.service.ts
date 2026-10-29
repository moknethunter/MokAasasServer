import { MessageStore } from "../../ports/message-store.js";
import { ClientConnection } from "../../ports/client-connection.js";
import { UserRepository } from "../../ports/auth.port.js";
import { logger } from "../../logger.js";

export class ChatService {
  constructor(
    private messageStore: MessageStore,
    private connection: ClientConnection,
    private userRepo: UserRepository
  ) {}

  setup() {
    this.connection.onMessage("chat message", async (data) => {
      // التحقق من وجود المستقبل
      const targetUser = await this.userRepo.findByPhone(data.target);
      if (!targetUser) {
        return this.connection.emitToUser(data.sender, "chat:error", { message: "أنت لست مسجل على الشبكة أو الرقم غير صحيح." });
      }
      
      const saved = await this.messageStore.saveMessage(data.sender, data.target, data.text);
      this.connection.emitToUser(data.target, "chat message", saved);
      this.connection.emitToUser(data.sender, "chat message", saved);
    });
  }
}
