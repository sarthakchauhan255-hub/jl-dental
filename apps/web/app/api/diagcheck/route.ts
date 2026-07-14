import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// TEMPORARY diagnostic — delete after use. Guarded by a secret query param.
export async function GET(req: NextRequest): Promise<NextResponse> {
  if (req.nextUrl.searchParams.get("k") !== "jldiag2026") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const { connectDB } = await import("@/lib/db/connection");
    const mongoose = (await import("mongoose")).default;
    await connectDB();

    const dbName = mongoose.connection.name;
    const email = req.nextUrl.searchParams.get("email")?.toLowerCase().trim();
    const usersColl = mongoose.connection.db!.collection("users");
    const totalUsers = await usersColl.countDocuments();

    let emailFound: boolean | null = null;
    let isActive: unknown = null;
    let role: unknown = null;
    if (email) {
      const u = await usersColl.findOne({ email });
      emailFound = !!u;
      isActive = u?.isActive ?? null;
      role = u?.role ?? null;
    }
    return NextResponse.json({ liveDatabaseName: dbName, totalUsersInLiveDB: totalUsers, email, emailFound, isActive, role });
  } catch (e) {
    return NextResponse.json({ error: String(e).slice(0, 200) }, { status: 500 });
  }
}
