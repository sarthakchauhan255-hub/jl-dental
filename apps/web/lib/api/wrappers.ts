import { type NextRequest, NextResponse } from "next/server";
import { type ZodSchema }                 from "zod";
import { requireSession }                 from "@/lib/auth/session";
import { requirePermission }              from "@/lib/auth/rbac";
import { applyRateLimit }                 from "@/lib/security/rate-limit";
import { handleRouteError }               from "./errors";
import { parseBody }                      from "./validators";
import type { Ratelimit }                 from "@upstash/ratelimit";
import type { Permission, SessionPayload } from "@/types/auth";
import type { NextResponse as NR }        from "next/server";

type RouteContext = { params: Promise<Record<string, string>> };
type Handler<B = unknown>  = (
  req:     NextRequest,
  ctx:     RouteContext,
  session: SessionPayload,
  body?:   B
) => Promise<NextResponse>;

/**
 * Composable route handler wrappers.
 *
 * Usage:
 *   export const POST = withAuth("doctors.create",
 *     withBody(doctorSchema,
 *       async (req, ctx, session, body) => { ... }
 *     )
 *   );
 */

/** Wrap handler with async error catching. */
export function withErrorHandling(
  handler: (req: NextRequest, ctx: RouteContext) => Promise<NextResponse>
) {
  return async (req: NextRequest, ctx: RouteContext): Promise<NextResponse> => {
    try {
      return await handler(req, ctx);
    } catch (err) {
      return handleRouteError(err);
    }
  };
}

/** Require authenticated session. Injects session into handler. */
export function withAuth(
  permission: Permission | null,
  handler: Handler
) {
  return withErrorHandling(async (req, ctx) => {
    const session = await requireSession();
    if (permission) requirePermission(session.role, permission);
    return handler(req, ctx, session);
  });
}

/** Require auth + validate + parse request body. */
export function withBody<B>(
  schema:    ZodSchema<B>,
  permission: Permission | null,
  handler:   (req: NextRequest, ctx: RouteContext, session: SessionPayload, body: B) => Promise<NextResponse>
) {
  return withErrorHandling(async (req, ctx) => {
    const session = await requireSession();
    if (permission) requirePermission(session.role, permission);
    const body = await parseBody(req, schema);
    return handler(req, ctx, session, body);
  });
}

/** Apply rate limiting before handler. */
export function withRateLimit(
  limiter:    Ratelimit,
  keyPrefix:  string,
  handler:    (req: NextRequest, ctx: RouteContext) => Promise<NextResponse>
) {
  return async (req: NextRequest, ctx: RouteContext): Promise<NextResponse> => {
    const ip  = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
    const res = await applyRateLimit(limiter, `${keyPrefix}:${ip}`);
    if (res) return res as NR;
    return handler(req, ctx);
  };
}
