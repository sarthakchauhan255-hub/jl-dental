/**
 * Password reset service.
 *
 * Token architecture:
 * - Generate: crypto.randomBytes(32) → raw token (sent in email)
 * - Store:    sha256(rawToken) → only the hash stored in DB
 * - Verify:   sha256(incoming) → compare with stored hash (constant-time via crypto.timingSafeEqual)
 * - Never:    store raw token, use JWT for reset, raw string comparison
 */
import crypto        from "crypto";
import bcrypt        from "bcryptjs";
import { connectDB } from "@/lib/db/connection";
import { User }      from "@/models/User";
import { PasswordResetToken } from "@/models/PasswordResetToken";
import { AUTH }      from "@/lib/constants/auth";
import { ResetTokenExpiredError } from "@/lib/auth/errors";
import { logger }    from "@/lib/logger";

/** sha256 hex digest of input */
function sha256(input: string): string {
  return crypto.createHash("sha256").update(input, "utf8").digest("hex");
}

/** Timing-safe comparison of two hex strings */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
}

export interface ResetTokenResult {
  rawToken: string;
  userId:   string;
}

/**
 * Generate and persist a password reset token for a given email.
 * Returns null if no matching active user (caller never reveals this externally).
 */
export async function createResetToken(email: string): Promise<ResetTokenResult | null> {
  await connectDB();

  const user = await User.findOne({ email: email.toLowerCase().trim(), isActive: true })
    .select("_id");
  if (!user) return null;

  const rawToken  = crypto.randomBytes(AUTH.RESET_TOKEN_BYTES).toString("hex");
  const tokenHash = sha256(rawToken);

  // Invalidate any existing tokens for this user before creating new
  await PasswordResetToken.deleteMany({ userId: user._id });

  await PasswordResetToken.create({
    userId:    user._id,
    tokenHash,
    expiresAt: new Date(Date.now() + AUTH.RESET_TOKEN_TTL_MS),
  });

  return { rawToken, userId: String(user._id) };
}

/**
 * Validate a reset token and return the associated userId.
 * Uses sha256 + timingSafeEqual — no bcrypt iteration over candidates needed.
 */
export async function validateResetToken(rawToken: string): Promise<string> {
  await connectDB();

  const incoming = sha256(rawToken);

  // Find all non-expired, unused tokens and compare hashes safely
  const candidates = await PasswordResetToken.find({
    used:      false,
    expiresAt: { $gt: new Date() },
  }).select("tokenHash userId");

  for (const candidate of candidates) {
    if (safeEqual(incoming, candidate.tokenHash)) {
      return String(candidate.userId);
    }
  }

  throw new ResetTokenExpiredError();
}

/**
 * Apply new password and invalidate all sessions.
 * Must be called after validateResetToken succeeds.
 */
export async function applyPasswordReset(
  userId: string,
  rawToken: string,
  newPassword: string
): Promise<void> {
  await connectDB();

  const hash = await bcrypt.hash(newPassword, AUTH.BCRYPT_ROUNDS);

  // Update password + increment tokenVersion (invalidates all active JWTs)
  await User.findByIdAndUpdate(userId, {
    $set: { passwordHash: hash },
    $inc: { tokenVersion: 1 },
  });

  // Mark token used — immediate invalidation
  const incoming = sha256(rawToken);
  await PasswordResetToken.findOneAndUpdate(
    { userId, tokenHash: incoming, used: false },
    { $set: { used: true, usedAt: new Date() } }
  );

  logger.info("Password reset applied", { userId });
}

/**
 * Change password for an authenticated user.
 * Verifies current password before applying new one.
 */
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  await connectDB();

  const user = await User.findById(userId).select("+passwordHash isActive email");
  if (!user?.isActive) throw new Error("Account not found.");

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) throw new Error("WRONG_PASSWORD");

  const hash = await bcrypt.hash(newPassword, AUTH.BCRYPT_ROUNDS);
  await User.findByIdAndUpdate(userId, {
    $set: { passwordHash: hash },
    $inc: { tokenVersion: 1 },
  });
}
