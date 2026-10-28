export const COOKIE_NAME = 'vs_session' as const;

export const RATE_LIMITS = {
  LOGIN: { max: 5, windowMs: 15 * 60 * 1000 },
  DEFAULT: { max: 100, windowMs: 60 * 1000 },
} as const;

export const PATHS = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  API_PREFIX: '/api/v1',
} as const;
