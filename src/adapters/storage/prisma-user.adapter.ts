import { PrismaClient } from "@prisma/client";
import { UserRepository, UserRecord } from "../../ports/auth.port.js";

const prisma = new PrismaClient();

export class PrismaUserAdapter implements UserRepository {
  async findByUsername(username: string): Promise<UserRecord | null> {
    return prisma.user.findUnique({ where: { username } });
  }

  async createUser(username: string, passwordHash: string, role: string = "user"): Promise<UserRecord> {
    return prisma.user.create({
      data: { username, passwordHash, role },
    });
  }
}
