import type { NextRequest } from "next/server";
import { env } from "@/env";

/**
 * Validates the Origin (or Referer fallback) of a request against the app URL.
 * Used on all state-mutating auth routes: login, logout, reset, change-password.
 *
 * Returns null when valid (proceed), NextResponse when blocked.
 * Lightweight — no CSRF tokens or legacy framework overhead.
 */
export function validateOrigin(req: NextRequest): boolean {
  const appUrl = env.NEXT_PUBLIC_APP_URL;

  // Skip in dev without APP_URL or for same-host server-to-server
  if (!appUrl) return true;

  let appOrigin: string;
  try {
    appOrigin = new URL(appUrl).origin;
  } catch {
    return true; // Malformed APP_URL — skip rather than block
  }

  const origin  = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const host    = req.headers.get("host");

  // Allow same-origin requests
  if (origin) return origin === appOrigin;

  // Referer fallback (some browsers omit Origin on same-origin POST)
  if (referer) {
    try {
      return new URL(referer).origin === appOrigin;
    } catch {
      return false;
    }
  }

  // No origin headers — allow if Host matches (server-to-server, curl, Vercel Cron)
  if (host) {
    const appHost = new URL(appUrl).host;
    return host === appHost;
  }

  return true;
}
