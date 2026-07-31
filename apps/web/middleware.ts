/**
 * Next.js Edge Middleware — intentionally thin.
 *
 * Rules:
 * - No DB calls (edge runtime has no Mongoose)
 * - No heavy RBAC (role checks happen in API route handlers)
 * - JWT verify only — no tokenVersion check (DB needed for that, done in requireSession())
 * - Origin check on mutation API routes (CSRF layer)
 *
 * This runs on every matched request before the handler.
 * Keep it fast — it's on the critical path.
 */
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify }                 from "jose";

const SECRET      = new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-secret-32-chars-minimum-ok");
const AUTH_COOKIE = "jl_auth_token";
const LOGIN_PATH  = "/admin/login";
const APP_URL     = process.env.NEXT_PUBLIC_APP_URL ?? "";

// ─── Route classification ────────────────────────────────────────────────────
type RouteType = "admin_page" | "admin_api" | "cron" | "mutation_api" | "public";

function classifyRoute(method: string, pathname: string): RouteType {
  if (pathname.startsWith("/api/cron"))               return "cron";
  if (pathname.startsWith("/admin"))                  return "admin_page";
  if (pathname.startsWith("/api/auth"))               return "admin_api";
  if (pathname.startsWith("/api/") &&
      ["POST","PATCH","PUT","DELETE"].includes(method)) return "mutation_api";
  return "public";
}

/**
 * Forbid browser/proxy caching of an authenticated admin response so the Back
 * button cannot show a stale, post-logout snapshot of protected content.
 */
function noStore(res: NextResponse): NextResponse {
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.headers.set("Pragma", "no-cache");
  res.headers.set("Expires", "0");
  return res;
}

// ─── Admin page protection ────────────────────────────────────────────────────
async function handleAdminPage(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;
  // Normalize trailing slash so "/admin/login/" also matches (prevents redirect loop)
  const normalized = pathname.replace(/\/+$/, "") || "/";
  if (normalized === LOGIN_PATH) return NextResponse.next();

  // Bare "/admin" → send straight to login (avoids a 404 on the group root)
  if (normalized === "/admin") return redirectToLogin(req);

  const token = req.cookies.get(AUTH_COOKIE)?.value;
  if (!token) return redirectToLogin(req);

  try {
    await jwtVerify(token, SECRET);
    // Authenticated admin page — never cache (defeats Back-button-after-logout).
    return noStore(NextResponse.next());
  } catch {
    const res = redirectToLogin(req);
    res.cookies.delete(AUTH_COOKIE);
    return res;
  }
}

// ─── Cron protection ──────────────────────────────────────────────────────────
function handleCron(req: NextRequest): NextResponse {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "Cron not configured" }, { status: 503 });
  }
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.next();
}

// ─── Origin check for mutation API routes (CSRF protection) ──────────────────
function handleMutationOriginCheck(req: NextRequest): NextResponse | null {
  if (!APP_URL) return null; // Skip in local dev without APP_URL

  const origin  = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const appOrigin = new URL(APP_URL).origin;

  // Allow same-origin and requests with no origin (server-to-server)
  if (!origin && !referer) return null;
  if (origin && origin === appOrigin) return null;
  if (!origin && referer && referer.startsWith(appOrigin)) return null;

  return NextResponse.json(
    { error: "Cross-origin request blocked" },
    { status: 403 }
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function redirectToLogin(req: NextRequest): NextResponse {
  const normalized = req.nextUrl.pathname.replace(/\/+$/, "") || "/";
  // Safety: if we're already on the login path, don't redirect (loop guard)
  if (normalized === LOGIN_PATH) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = LOGIN_PATH;
  url.searchParams.set("from", req.nextUrl.pathname);
  return NextResponse.redirect(url);
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export async function middleware(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;
  const type = classifyRoute(req.method, pathname);

  switch (type) {
    case "admin_page": return handleAdminPage(req);
    case "cron":       return handleCron(req);
    case "mutation_api": {
      // Origin check for CSRF — does not block if origin absent (server-to-server ok)
      const blocked = handleMutationOriginCheck(req);
      return blocked ?? NextResponse.next();
    }
    // admin_api: auth handled in route handler (requireSession)
    // public: pass through
    default: return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/cron/:path*",
    "/api/:path*",
  ],
};