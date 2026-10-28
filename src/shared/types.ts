export interface AdminPayload {
  sub: string;
  role: 'admin';
  iat?: number;
  exp?: number;
}

export interface AuthContext {
  username: string;
  role: 'admin';
}

// تمتد Express.Request لتحمل req.auth
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      correlationId?: string;
      auth?: AuthContext;
    }
  }
}

export {};
