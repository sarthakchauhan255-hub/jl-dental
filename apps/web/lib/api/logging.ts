import { logger }           from "@/lib/logger";
import { generateRequestId } from "@/lib/security/request";
import type { NextRequest }  from "next/server";
import { env } from "@/env";

export interface RequestLogContext {
  requestId: string;
  method:    string;
  path:      string;
  ip:        string;
  startTime: number;
}

/** Initialize a request log context at the start of a handler. */
export function startRequestLog(req: NextRequest): RequestLogContext {
  const ctx: RequestLogContext = {
    requestId: generateRequestId(),
    method:    req.method,
    path:      req.nextUrl.pathname,
    ip:        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown",
    startTime: Date.now(),
  };

  if (env.NODE_ENV === "development") {
    logger.debug(`→ ${ctx.method} ${ctx.path}`, { requestId: ctx.requestId, ip: ctx.ip });
  }

  return ctx;
}

/** Log the completed response. Production-safe: no sensitive headers. */
export function endRequestLog(ctx: RequestLogContext, status: number, userId?: string): void {
  const duration = Date.now() - ctx.startTime;

  if (status >= 500) {
    logger.error(`✗ ${ctx.method} ${ctx.path} ${status} (${duration}ms)`, {
      requestId: ctx.requestId, ip: ctx.ip, userId,
    });
  } else if (status >= 400) {
    logger.warn(`! ${ctx.method} ${ctx.path} ${status} (${duration}ms)`, {
      requestId: ctx.requestId,
    });
  } else if (env.NODE_ENV === "development") {
    logger.debug(`✓ ${ctx.method} ${ctx.path} ${status} (${duration}ms)`, {
      requestId: ctx.requestId,
    });
  }
}
