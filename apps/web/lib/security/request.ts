import type { NextRequest } from "next/server";

/** Extract the real client IP, accounting for Vercel/proxy headers. */
export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

/**
 * Validate that a redirect target is safe (same origin, relative path).
 * Prevents open redirect vulnerabilities.
 */
export function isSafeRedirect(target: string | null | undefined): boolean {
  if (!target) return false;
  // Allow relative paths starting with /admin
  if (target.startsWith("/admin") && !target.includes("//")) return true;
  return false;
}

/** Generate a unique request ID for correlation in logs. */
export function generateRequestId(): string {
  return Math.random().toString(36).slice(2, 11);
}

/** Extract a sanitized user agent string (max 200 chars). */
export function getSafeUserAgent(req: NextRequest): string {
  return (req.headers.get("user-agent") ?? "").slice(0, 200);
}
