/**
 * Standardized application error classes.
 *
 * All API route handlers catch these and map to HTTP responses.
 * Never throw raw Error objects in business logic — use these instead.
 */

// ─── Base ─────────────────────────────────────────────────────────────────────
export class AppError extends Error {
  readonly statusCode: number;
  readonly code:       string;
  readonly isOperational: boolean;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.name           = this.constructor.name;
    this.statusCode     = statusCode;
    this.code           = code;
    this.isOperational  = true; // Expected, handled errors
    Error.captureStackTrace(this, this.constructor);
  }
}

// ─── Specific error types ─────────────────────────────────────────────────────

export class ValidationError extends AppError {
  readonly fields?: Record<string, string>;
  constructor(message: string, fields?: Record<string, string>) {
    super(message, 422, "VALIDATION_ERROR");
    this.fields = fields;
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Authentication required") {
    super(message, 401, "UNAUTHENTICATED");
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "You do not have permission to perform this action") {
    super(message, 403, "FORBIDDEN");
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(`${resource} not found`, 404, "NOT_FOUND");
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, "CONFLICT");
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Too many requests. Please try again later.") {
    super(message, 429, "RATE_LIMITED");
  }
}

export class ExternalServiceError extends AppError {
  readonly service: string;
  constructor(service: string, message?: string) {
    super(message ?? `${service} service is temporarily unavailable`, 503, "EXTERNAL_SERVICE_ERROR");
    this.service = service;
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(message, 400, "BAD_REQUEST");
  }
}

// ─── Type guard ───────────────────────────────────────────────────────────────
export function isAppError(err: unknown): err is AppError {
  return err instanceof AppError;
}

/**
 * Convert any caught error to a safe client-facing message.
 * Never expose stack traces or internal details to the browser.
 */
export function toSafeError(err: unknown): { message: string; code: string; statusCode: number } {
  if (isAppError(err)) {
    return {
      message:    err.message,
      code:       err.code,
      statusCode: err.statusCode,
    };
  }
  // Unknown / programmer errors — don't expose details
  return {
    message:    "An unexpected error occurred. Please try again.",
    code:       "INTERNAL_ERROR",
    statusCode: 500,
  };
}
