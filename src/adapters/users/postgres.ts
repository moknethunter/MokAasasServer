import type { PrismaClient } from '@prisma/client';
import type { UserRepo, UserRecord } from '../../ports/user-repo.js';

export class PostgresUserRepo implements UserRepo {
  constructor(private prisma: PrismaClient) {}

  async findByUsername(username: string): Promise<UserRecord | null> {
    const user = await this.prisma.user.findUnique({ where: { username } });
    return user ? this.toRecord(user) : null;
  }

  async findById(id: string): Promise<UserRecord | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? this.toRecord(user) : null;
  }

  private toRecord(user: {
    id: string;
    username: string;
    passwordHash: string;
    role: string;
  }): UserRecord {
    return {
      id: user.id,
      username: user.username,
      passwordHash: user.passwordHash,
      role: user.role === 'admin' ? 'admin' : 'user',
    };
  }
}
