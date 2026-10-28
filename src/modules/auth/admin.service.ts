import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../../config.js";
import type { SessionStore, SessionPayload } from "../../ports/session-store.js";

let store: SessionStore | null = null;

export function setSessionStore(s: SessionStore): void {
  store = s;
}

export async function verifyCredentials(username: string, password: string): Promise<boolean> {
  if (username !== config.ADMIN_USERNAME) {
    await bcrypt.compare(password, "$2a$12$invalidhashinvalidhashinvalidhashinvalidhas");
    return false;
  }
  return bcrypt.compare(password, config.ADMIN_PASSWORD_HASH);
}

export async function issueSession(username: string): Promise<{ token: string }> {
  if (!store) throw new Error("SessionStore not initialized");
  const payload: SessionPayload = { sub: username, role: "admin" };
  const token = jwt.sign(payload, config.SESSION_SECRET, {
    expiresIn: `${config.SESSION_TTL_HOURS}h`,
  });
  await store.create(token, payload, config.SESSION_TTL_HOURS);
  return { token };
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  if (!store) return null;
  const stored = await store.get(token);
  if (!stored) return null;
  try {
    return jwt.verify(token, config.SESSION_SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

export async function revokeSession(token: string): Promise<void> {
  if (store) await store.revoke(token);
}

export const cookieOptions = {
  httpOnly: true,
  secure: config.isProd,
  sameSite: "strict" as const,
  maxAge: config.SESSION_TTL_HOURS * 60 * 60 * 1000,
  path: "/",
};
