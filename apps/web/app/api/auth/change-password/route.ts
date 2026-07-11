import { NextRequest, NextResponse }       from "next/server";
import { changePassword }                  from "@/lib/auth/services";
import { requireSession, clearAuthCookie } from "@/lib/auth/session";
import { validateOrigin }                   from "@/lib/security/origin";
import { auditAuth }                       from "@/lib/audit";
import { logger }                          from "@/lib/logger";
import { getIdentifier }                   from "@/lib/security/rate-limit";
import { changePasswordSchema }            from "@/lib/validations";
import { SessionExpiredError }              from "@/lib/auth/errors";

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!validateOrigin(req)) return NextResponse.json({ success: false, error: "Forbidden." }, { status: 403 });

  let session: Awaited<ReturnType<typeof requireSession>>;
  try { session = await requireSession(); }
  catch { return NextResponse.json({ success: false, error: new SessionExpiredError().message }, { status: 401 }); }

  let currentPassword: string; let newPassword: string;
  try { ({ currentPassword, newPassword } = changePasswordSchema.parse(await req.json())); }
  catch { return NextResponse.json({ success: false, error: "Invalid request." }, { status: 422 }); }

  const ip = getIdentifier(req);
  try {
    await changePassword(session.userId, currentPassword, newPassword);
    await clearAuthCookie();
    await auditAuth({ userId: session.userId, email: "", event: "password_changed", success: true, ip });
    return NextResponse.json({ success: true, data: { message: "Password changed. Please sign in again." } });
  } catch (err) {
    if (err instanceof Error && err.message === "WRONG_PASSWORD") {
      await auditAuth({ userId: session.userId, email: "", event: "login_failed", success: false, ip, meta: { action: "change_password" } });
      return NextResponse.json({ success: false, error: "Current password is incorrect." }, { status: 401 });
    }
    logger.error("Change password error", { err: String(err) });
    return NextResponse.json({ success: false, error: "An error occurred." }, { status: 500 });
  }
}
