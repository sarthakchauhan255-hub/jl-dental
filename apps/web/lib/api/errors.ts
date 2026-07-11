import { NextResponse }   from "next/server";
import { ZodError }       from "zod";
import { isAppError }     from "@/lib/security/errors";
import { logger }         from "@/lib/logger";
import { err }            from "./responses";

/**
 * Convert any caught error to a typed NextResponse.
 * Use at the boundary of every route handler catch block.
 * Never expose raw error details to the client.
 */
export function handleRouteError(error: unknown): NextResponse {
  if (error instanceof ZodError) {
    const fields = Object.fromEntries(
      error.issues.map((i) => [String(i.path.join(".")), i.message])
    );
    return err("Validation failed.", 422, { code: "VALIDATION_ERROR", fields });
  }

  if (isAppError(error)) {
    if (error.statusCode >= 500) {
      logger.error("Application error", { code: error.code, msg: error.message });
    }
    return err(error.message, error.statusCode, { code: error.code });
  }

  logger.error("Unhandled route error", { error: String(error) });
  return err("An unexpected error occurred.", 500, { code: "INTERNAL_ERROR" });
}
