import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../../config.js";

export interface SessionPayload {
  sub: string;
  role: "admin";
  iat?: number;
  exp?: number;
}

export async function verifyCredentials(username: string, password: string): Promise<boolean> {
  if (username !== config.ADMIN_USERNAME) {
    await bcrypt.compare(password, "$2a$12$invalidhashinvalidhashinvalidhashinvalidhas");
    return false;
  }
  return bcrypt.compare(password, config.ADMIN_PASSWORD_HASH);
}

export async function issueSession(username: string): Promise<{ token: string }> {
  const token = jwt.sign({ sub: username, role: "admin" }, config.SESSION_SECRET, {
    expiresIn: `${config.SESSION_TTL_HOURS}h`,
  });
  return { token };
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    return jwt.verify(token, config.SESSION_SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

export const cookieOptions = {
  httpOnly: true,
  secure: config.isProd,
  sameSite: "strict" as const,
  maxAge: config.SESSION_TTL_HOURS * 60 * 60 * 1000,
  path: "/",
};
