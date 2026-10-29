export interface UserRecord {
  id: string;
  phoneNumber: string;
  username: string;
  passwordHash: string;
  role: string;
}

export interface UserRepository {
  findByPhone(phoneNumber: string): Promise<UserRecord | null>;
  createUser(phoneNumber: string, username: string, passwordHash: string): Promise<UserRecord>;
}

export interface PasswordHasher {
  hash(password: string): Promise<string>;
  compare(password: string, hash: string): Promise<boolean>;
}

export interface TokenService {
  sign(payload: Record<string, unknown>): string;
  verify(token: string): any;
}
