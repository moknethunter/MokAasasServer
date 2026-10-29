import bcrypt from "bcryptjs";
import { PasswordHasher } from "../../ports/auth.port.js";

export class BcryptHasherAdapter implements PasswordHasher {
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
