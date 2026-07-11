/**
 * Rate limiting via Upstash Redis.
 * Edge-compatible, serverless-safe, consistent across deployments.
 */
import { Ratelimit } from "@upstash/ratelimit";
import { Redis }     from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";
import { env } from "@/env";

// ─── Redis client ─────────────────────────────────────────────────────────────
// Lazy-initialized to avoid errors during build when env vars aren't present
let redis: Redis | null = null;

function getRedis(): Redis {
  if (!redis) {
    redis = new Redis({
      url:   env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return redis;
}

// ─── Rate limiter factory — lazy (avoids Upstash warning at build time) ────────
const limiterCache = new Map<string, Ratelimit>();

function getLimiter(requests: number, windowSeconds: number): Ratelimit {
  const key = `${requests}:${windowSeconds}`;
  if (!limiterCache.has(key)) {
    limiterCache.set(key, new Ratelimit({
      redis:     getRedis(),
      limiter:   Ratelimit.slidingWindow(requests, `${windowSeconds} s`),
      analytics: false,
    }));
  }
  return limiterCache.get(key)!;
}

// ─── Named limiters per endpoint type ────────────────────────────────────────
export const limiters = {
  get auth()       { return getLimiter(5,  15 * 60); },
  get appointments(){ return getLimiter(3,  60 * 60); },
  get reviews()    { return getLimiter(2,  24 * 60 * 60); },
  get mediaUpload(){ return getLimiter(20, 60 * 60); },
  get api()        { return getLimiter(100, 60); },
};

// ─── Helper: get identifier from request ────────────────────────────────────
export function getIdentifier(req: NextRequest, suffix?: string): string {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "anonymous";
  return suffix ? `${ip}:${suffix}` : ip;
}

// ─── Helper: apply rate limit and return error response if exceeded ──────────
export async function applyRateLimit(
  limiter: Ratelimit,
  identifier: string
): Promise<NextResponse | null> {
  const { success, limit, remaining, reset } = await limiter.limit(identifier);

  if (!success) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit":     String(limit),
          "X-RateLimit-Remaining": String(remaining),
          "X-RateLimit-Reset":     String(reset),
          "Retry-After":           String(Math.ceil((reset - Date.now()) / 1000)),
        },
      }
    );
  }

  return null; // null = not rate limited, proceed
}
