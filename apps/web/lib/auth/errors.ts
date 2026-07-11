import { AppError } from "@/lib/security/errors";

export class InvalidCredentialsError extends AppError {
  constructor() {
    super("Invalid email or password.", 401, "INVALID_CREDENTIALS");
  }
}

export class SessionExpiredError extends AppError {
  constructor() {
    super("Your session has expired. Please sign in again.", 401, "SESSION_EXPIRED");
  }
}

export class ResetTokenExpiredError extends AppError {
  constructor() {
    super("Invalid or expired reset link.", 400, "RESET_TOKEN_EXPIRED");
  }
}

export class AccountInactiveError extends AppError {
  constructor() {
    super("This account has been deactivated.", 403, "ACCOUNT_INACTIVE");
  }
}
