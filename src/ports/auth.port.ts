export interface UserRecord {
  id: string;
  username: string;
  passwordHash: string;
  role: string;
}

export interface UserRepository {
  findByUsername(username: string): Promise<UserRecord | null>;
  createUser(username: string, passwordHash: string, role?: string): Promise<UserRecord>;
}

export interface PasswordHasher {
  hash(password: string): Promise<string>;
  compare(password: string, hash: string): Promise<boolean>;
}

export interface TokenService {
  sign(payload: Record<string, unknown>): string;
  verify(token: string): any;
}
