import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class ChatService {
  async getHistory() {
    return prisma.message.findMany({
      take: 50,
      orderBy: { createdAt: 'asc' }
    });
  }

  async saveMessage(sender: string, text: string) {
    return prisma.message.create({
      data: { sender, content: text }
    });
  }
}
