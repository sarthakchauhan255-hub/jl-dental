import { NextRequest, NextResponse }             from "next/server";
import { validateCredentials, recordLogin }       from "@/lib/auth/services";
import { createToken, setAuthCookie }             from "@/lib/auth/session";
import { validateOrigin }                         from "@/lib/security/origin";
import { limiters, getIdentifier, applyRateLimit } from "@/lib/security/rate-limit";
import { auditAuth }                              from "@/lib/audit";
import { logger }                                 from "@/lib/logger";
import { loginSchema }                            from "@/lib/validations";
import { isAppError }                             from "@/lib/security/errors";

const GENERIC = "Invalid email or password.";

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!validateOrigin(req)) {
    return NextResponse.json({ success: false, error: "Forbidden." }, { status: 403 });
  }

  const ip = getIdentifier(req);
  const ipBlock = await applyRateLimit(limiters.auth, `login:ip:${ip}`);
  if (ipBlock) return ipBlock;

  let email: string;
  let password: string;
  try {
    ({ email, password } = loginSchema.parse(await req.json()));
    email = email.toLowerCase().trim();
  } catch {
    return NextResponse.json({ success: false, error: GENERIC }, { status: 401 });
  }

  const emailBlock = await applyRateLimit(limiters.auth, `login:email:${email}`);
  if (emailBlock) {
    await auditAuth({ email, event: "lockout_triggered", success: false, ip });
    return emailBlock;
  }

  try {
    const user  = await validateCredentials(email, password);
    const token = await createToken({
      userId:       user.id,
      role:         user.role,
      clinicId:     user.clinicId,
      tokenVersion: user.tokenVersion,
    });

    await setAuthCookie(token);
    await recordLogin(user.id);
    await auditAuth({
      userId:    user.id,
      email,
      event:     "login_success",
      success:   true,
      ip,
      userAgent: req.headers.get("user-agent") ?? "",
    });

    return NextResponse.json({
      success: true,
      data: { id: user.id, name: user.name, email: user.email, role: user.role, clinicId: user.clinicId },
    });
  } catch (err) {
    if (isAppError(err)) {
      await auditAuth({ email, event: "login_failed", success: false, ip, userAgent: req.headers.get("user-agent") ?? "" });
      return NextResponse.json({ success: false, error: GENERIC }, { status: 401 });
    }
    logger.error("Login error", { err: String(err) });
    return NextResponse.json({ success: false, error: "An error occurred." }, { status: 500 });
  }
}
