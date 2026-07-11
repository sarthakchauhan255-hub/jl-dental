import { z } from "zod";
import type { SessionPayload } from "@/types/auth";

/**
 * Zod schema for decoded JWT payloads.
 * jwtVerify returns unknown — always validate before use.
 */
export const sessionPayloadSchema = z.object({
  userId:       z.string().min(1),
  role:         z.enum(["superadmin", "admin", "receptionist", "content_manager", "doctor"]),
  clinicId:     z.string().nullable(),
  tokenVersion: z.number().int(),
  iat:          z.number().int(),
  exp:          z.number().int(),
});

export function parseSessionPayload(raw: unknown): SessionPayload {
  return sessionPayloadSchema.parse(raw) as SessionPayload;
}
