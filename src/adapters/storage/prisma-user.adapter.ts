import { PrismaClient } from "@prisma/client";
import { UserRepository, UserRecord } from "../../ports/auth.port.js";

const prisma = new PrismaClient();

export class PrismaUserAdapter implements UserRepository {
  async findByPhone(phoneNumber: string): Promise<UserRecord | null> {
    return prisma.user.findUnique({ where: { phoneNumber } });
  }

  async createUser(phoneNumber: string, username: string, passwordHash: string): Promise<UserRecord> {
    return prisma.user.create({
      data: { phoneNumber, username, passwordHash },
    });
  }
}
