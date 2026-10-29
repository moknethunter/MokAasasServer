import jwt from "jsonwebtoken";
import { TokenService } from "../../ports/auth.port.js";
import { config } from "../../config.js";

export class JwtTokenAdapter implements TokenService {
  sign(payload: Record<string, unknown>): string {
    return jwt.sign(payload, config.SESSION_SECRET, { expiresIn: "7d" });
  }
  verify(token: string): any {
    return jwt.verify(token, config.SESSION_SECRET);
  }
}
