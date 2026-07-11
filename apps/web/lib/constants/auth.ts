/** All auth-related constants. No scattered magic numbers in auth code. */
export const AUTH = {
  COOKIE_NAME:          "jl_auth_token",
  COOKIE_PATH:          "/",
  TOKEN_EXPIRY_SECONDS: 7 * 24 * 60 * 60,
  TOKEN_EXPIRY_STRING:  "7d",
  RESET_TOKEN_BYTES:    32,
  RESET_TOKEN_TTL_MS:   60 * 60 * 1000,
  RESET_TOKEN_TTL_S:    60 * 60,
  LOGIN_WINDOW_S:       15 * 60,
  LOGIN_MAX_ATTEMPTS:   5,
  RESET_WINDOW_S:       60 * 60,
  RESET_MAX_ATTEMPTS:   3,
  BCRYPT_ROUNDS:        12,
  /** Prevents timing attacks when user not found — bcrypt still runs */
  DUMMY_HASH: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PcDW2",
} as const;
