import { NextRequest, NextResponse }  from "next/server";
import { clearAuthCookie, getSession } from "@/lib/auth/session";
import { validateOrigin }              from "@/lib/security/origin";
import { auditAuth }                   from "@/lib/audit";
import { getIdentifier }               from "@/lib/security/rate-limit";

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!validateOrigin(req)) {
    return NextResponse.json({ success: false, error: "Forbidden." }, { status: 403 });
  }

  const session = await getSession();
  if (session) {
    await auditAuth({ userId: session.userId, email: "", event: "logout", success: true, ip: getIdentifier(req) });
  }

  await clearAuthCookie();
  return NextResponse.json({ success: true });
}
