import { ErrorCodes, type ErrorCode } from './shared/error-codes.js';

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: ErrorCode = ErrorCodes.INTERNAL,
    public readonly status: number = 500,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(msg = 'Not Found') {
    super(msg, ErrorCodes.NOT_FOUND, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(msg = 'Unauthorized') {
    super(msg, ErrorCodes.AUTH_FAILED, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(msg = 'Forbidden') {
    super(msg, ErrorCodes.FORBIDDEN, 403);
  }
}

export class ValidationError extends AppError {
  constructor(msg = 'Invalid input', details?: unknown) {
    super(msg, ErrorCodes.INVALID_INPUT, 400, details);
  }
}
