export interface SessionPayload {
  sub: string;
  role: 'admin' | 'user';
  iat?: number;
  exp?: number;
}

export interface SessionStore {
  create(token: string, payload: SessionPayload, ttlHours: number): Promise<void>;
  get(token: string): Promise<SessionPayload | null>;
  revoke(token: string): Promise<void>;
}
