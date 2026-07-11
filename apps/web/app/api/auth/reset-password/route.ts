import { NextRequest, NextResponse }              from "next/server";
import { validateResetToken, applyPasswordReset } from "@/lib/auth/services";
import { validateOrigin }                          from "@/lib/security/origin";
import { limiters, getIdentifier, applyRateLimit } from "@/lib/security/rate-limit";
import { auditAuth }                              from "@/lib/audit";
import { logger }                                 from "@/lib/logger";
import { resetPasswordSchema }                    from "@/lib/validations";
import { isAppError }                             from "@/lib/security/errors";

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  if (!validateOrigin(req)) return NextResponse.json({ success: false, error: "Forbidden." }, { status: 403 });
  const ip = getIdentifier(req);
  const block = await applyRateLimit(limiters.auth, `reset-confirm:ip:${ip}`);
  if (block) return block;

  let token: string; let password: string;
  try { ({ token, password } = resetPasswordSchema.parse(await req.json())); }
  catch { return NextResponse.json({ success: false, error: "Invalid or expired reset link." }, { status: 400 }); }

  try {
    const userId = await validateResetToken(token);
    await applyPasswordReset(userId, token, password);
    await auditAuth({ userId, email: "", event: "password_reset_completed", success: true, ip });
    return NextResponse.json({ success: true, data: { message: "Password updated." } });
  } catch (err) {
    if (isAppError(err)) return NextResponse.json({ success: false, error: err.message }, { status: err.statusCode });
    logger.error("Reset confirm error", { err: String(err) });
    return NextResponse.json({ success: false, error: "An error occurred." }, { status: 500 });
  }
}
