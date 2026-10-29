import { PrismaClient } from "@prisma/client";
import { MessageStore, MessageRecord } from "../../ports/message-store.js";

const prisma = new PrismaClient();

export class PrismaMessageAdapter implements MessageStore {
  async getHistory(limit: number): Promise<MessageRecord[]> {
    return prisma.message.findMany({
      take: limit,
      orderBy: { createdAt: "asc" },
    });
  }

  async saveMessage(sender: string, content: string): Promise<MessageRecord> {
    return prisma.message.create({
      data: { sender, content },
    });
  }
}
