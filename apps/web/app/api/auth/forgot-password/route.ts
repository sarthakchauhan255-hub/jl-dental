import { NextRequest, NextResponse }              from "next/server";
import { createResetToken }                       from "@/lib/auth/services";
import { validateOrigin }                          from "@/lib/security/origin";
import { limiters, getIdentifier, applyRateLimit } from "@/lib/security/rate-limit";
import { auditAuth }                              from "@/lib/audit";
import { logger }                                 from "@/lib/logger";
import { resetPasswordRequestSchema }             from "@/lib/validations";
import { env } from "@/env";
import { BRAND } from "@/config/branding";

const GENERIC_OK = { success: true, data: { message: "If that email is registered, a reset link has been sent." } };

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!validateOrigin(req)) return NextResponse.json({ success: false, error: "Forbidden." }, { status: 403 });

  const ip = getIdentifier(req);
  const block = await applyRateLimit(limiters.auth, `reset:ip:${ip}`);
  if (block) return block;

  let email: string;
  try {
    ({ email } = resetPasswordRequestSchema.parse(await req.json()));
    email = email.toLowerCase().trim();
  } catch { return NextResponse.json(GENERIC_OK); }

  try {
    const result = await createResetToken(email);
    if (!result) {
      await new Promise((r) => setTimeout(r, 200 + Math.random() * 100));
      return NextResponse.json(GENERIC_OK);
    }
    const resetUrl = `${env.NEXT_PUBLIC_APP_URL}/admin/reset-password?token=${result.rawToken}&uid=${result.userId}`;
    import("@/lib/notifications/email")
      .then(({ sendEmail }) => sendEmail({ to: email, subject: `Reset your ${BRAND.ADMIN_LABEL} password`,
        html: `<p>Reset link (expires in 1 hour):</p><p><a href="${resetUrl}">${resetUrl}</a></p>` }))
      .catch((e: unknown) => logger.error("Reset email failed", { e: String(e) }));
    await auditAuth({ userId: result.userId, email, event: "password_reset_requested", success: true, ip });
  } catch (err) { logger.error("Forgot password error", { err: String(err) }); }

  return NextResponse.json(GENERIC_OK);
}
