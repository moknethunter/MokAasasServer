export const ErrorCodes = {
  AUTH_FAILED:       'E1001_AUTH_FAILED',
  AUTH_RATE_LIMITED: 'E1002_AUTH_RATE_LIMITED',
  AUTH_EXPIRED:      'E1003_AUTH_EXPIRED',
  INVALID_INPUT:     'E2001_INVALID_INPUT',
  NOT_FOUND:         'E2002_NOT_FOUND',
  FORBIDDEN:         'E2003_FORBIDDEN',
  CONFLICT:          'E2004_CONFLICT',
  DEPENDENCY_DOWN:   'E3001_DEPENDENCY_DOWN',
  INTERNAL:          'E9001_INTERNAL',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
