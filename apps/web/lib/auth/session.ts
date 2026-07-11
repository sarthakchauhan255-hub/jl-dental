import { SignJWT, jwtVerify }       from "jose";
import { cookies }                   from "next/headers";
import { env }                       from "@/env";
import { AUTH }                      from "@/lib/constants/auth";
import { parseSessionPayload }       from "@/lib/auth/token-schema";
import { SessionExpiredError }        from "@/lib/auth/errors";
import type { SessionPayload, UserRole, AuthUser } from "@/types/auth";

const SECRET = new TextEncoder().encode(env.JWT_SECRET);

// ─── Token ───────────────────────────────────────────────────────────────────
export async function createToken(
  payload: Omit<SessionPayload, "iat" | "exp">
): Promise<string> {
  return new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${AUTH.TOKEN_EXPIRY_SECONDS}s`)
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    // Always validate payload shape — never trust jwtVerify output directly
    return parseSessionPayload(payload);
  } catch {
    return null;
  }
}

// ─── Cookie ───────────────────────────────────────────────────────────────────
export async function setAuthCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(AUTH.COOKIE_NAME, token, {
    httpOnly: true,
    secure:   env.NODE_ENV === "production",
    sameSite: "strict",
    path:     AUTH.COOKIE_PATH,
    maxAge:   AUTH.TOKEN_EXPIRY_SECONDS,
  });
}

export async function clearAuthCookie(): Promise<void> {
  const store = await cookies();
  store.delete(AUTH.COOKIE_NAME);
}

export async function getAuthToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(AUTH.COOKIE_NAME)?.value ?? null;
}

// ─── Session ─────────────────────────────────────────────────────────────────
export async function getSession(): Promise<SessionPayload | null> {
  const token = await getAuthToken();
  if (!token) return null;
  return verifyToken(token);
}

/**
 * Require a valid, unexpired session with tokenVersion verified against DB.
 * Throws SessionExpiredError — never returns null.
 * Use this in API route handlers. Middleware does lightweight JWT-only check.
 */
export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new SessionExpiredError();

  try {
    const { connectDB } = await import("@/lib/db/connection");
    const { User }      = await import("@/models/User");
    await connectDB();

    const user = await User.findById(session.userId)
      .select("tokenVersion isActive")
      .lean();

    if (!user || !user.isActive || user.tokenVersion !== session.tokenVersion) {
      throw new SessionExpiredError();
    }
  } catch (err) {
    if (err instanceof SessionExpiredError) throw err;
    if (env.NODE_ENV === "production") throw new SessionExpiredError();
  }

  return session;
}

/** Returns full user object for display. Returns null if not authenticated. */
export async function getAuthUser(): Promise<AuthUser | null> {
  const session = await getSession();
  if (!session) return null;

  try {
    const { connectDB } = await import("@/lib/db/connection");
    const { User }      = await import("@/models/User");
    await connectDB();

    const user = await User.findById(session.userId)
      .select("name email role clinicId isActive")
      .lean();

    if (!user || !user.isActive) return null;

    return {
      id:       String(user._id),
      name:     user.name,
      email:    user.email,
      role:     user.role as UserRole,
      clinicId: user.clinicId ? String(user.clinicId) : null,
      isActive: user.isActive,
    };
  } catch {
    return null;
  }
}
