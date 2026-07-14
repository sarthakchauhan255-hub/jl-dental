/**
 * Credential validation service.
 * All DB access for auth lives here — routes stay thin.
 */
import bcrypt           from "bcryptjs";
import { connectDB }    from "@/lib/db/connection";
import { User }         from "@/models/User";
import { AUTH }         from "@/lib/constants/auth";
import { InvalidCredentialsError, AccountInactiveError } from "@/lib/auth/errors";
import type { AuthUser } from "@/types/auth";

export interface ValidatedUser {
  id:           string;
  name:         string;
  email:        string;
  role:         AuthUser["role"];
  clinicId:     string | null;
  tokenVersion: number;
}

/**
 * Validates email + password. Always runs bcrypt regardless of whether user exists
 * to prevent timing-based user enumeration attacks.
 */
export async function validateCredentials(
  email: string,
  password: string
): Promise<ValidatedUser> {
  await connectDB();

  // NOTE: use an explicit inclusion object — mixing "+field" with plain
  // inclusion fields in a select() STRING makes Mongoose drop passwordHash
  // (returns undefined), which silently breaks every login. Object form is
  // unambiguous and reliably returns the hash.
  const user = await User.findOne({ email: email.toLowerCase().trim() })
    .select({ passwordHash: 1, role: 1, isActive: 1, tokenVersion: 1, clinicId: 1, name: 1, email: 1 });

  // Always run bcrypt — dummy hash used when user missing
  const hashToCompare = user?.passwordHash ?? AUTH.DUMMY_HASH;
  const valid = await bcrypt.compare(password, hashToCompare);

  if (!user || !valid) throw new InvalidCredentialsError();
  if (!user.isActive)  throw new AccountInactiveError();

  return {
    id:           String(user._id),
    name:         user.name,
    email:        user.email,
    role:         user.role,
    clinicId:     user.clinicId ? String(user.clinicId) : null,
    tokenVersion: user.tokenVersion,
  };
}

/** Record successful login timestamp. */
export async function recordLogin(userId: string): Promise<void> {
  await connectDB();
  await User.updateOne({ _id: userId }, { $set: { lastLoginAt: new Date() } });
}
