import type { SessionStore, SessionPayload } from '../../ports/session-store.js';

interface Entry {
  payload: SessionPayload;
  expiresAt: number;
}

export class MemorySessionStore implements SessionStore {
  private sessions = new Map<string, Entry>();

  async create(token: string, payload: SessionPayload, ttlHours: number): Promise<void> {
    this.sessions.set(token, {
      payload,
      expiresAt: Date.now() + ttlHours * 60 * 60 * 1000,
    });
  }

  async get(token: string): Promise<SessionPayload | null> {
    const entry = this.sessions.get(token);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.sessions.delete(token);
      return null;
    }
    return entry.payload;
  }

  async revoke(token: string): Promise<void> {
    this.sessions.delete(token);
  }
}
