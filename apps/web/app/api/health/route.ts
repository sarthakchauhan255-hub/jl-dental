import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Health check for uptime monitoring / load balancers.
 * Exposes NO business data — only liveness and DB reachability.
 */
export async function GET(): Promise<NextResponse> {
  const checks: Record<string, "ok" | "error"> = { app: "ok" };
  let healthy = true;

  try {
    const { connectDB } = await import("@/lib/db/connection");
    const mongoose = (await import("mongoose")).default;
    await connectDB();
    const ping = await mongoose.connection.db?.admin().ping();
    checks.database = ping?.ok === 1 ? "ok" : "error";
    if (checks.database !== "ok") healthy = false;
  } catch {
    checks.database = "error";
    healthy = false;
  }

  return NextResponse.json(
    { status: healthy ? "healthy" : "degraded", checks, timestamp: new Date().toISOString() },
    { status: healthy ? 200 : 503 },
  );
}
