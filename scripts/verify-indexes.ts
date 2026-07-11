#!/usr/bin/env tsx
/**
 * Index verification script — run before production launch.
 * Connects to MongoDB and confirms all required indexes exist.
 *
 * Usage: npx tsx scripts/verify-indexes.ts
 */
import "dotenv/config";
import mongoose from "mongoose";

const REQUIRED_INDEXES: Record<string, string[][]> = {
  users:             [["email"], ["clinicId", "role"], ["isActive", "role"]],
  appointments:      [["clinicId", "status", "createdAt"], ["email", "status"], ["confirmedDate", "status"], ["createdAt", "status"]],
  blogposts:         [["slug"], ["clinicId", "status", "publishedAt"]],
  doctors:           [["slug"], ["clinicId", "isActive", "order"]],
  services:          [["slug"], ["clinicId", "isActive", "order"]],
  reviews:           [["clinicId", "status", "createdAt"]],
  faqs:              [["clinicId", "isActive", "order"]],
  galleries:         [["clinicId", "type", "isActive", "order"]],
  notificationlogs:  [["clinicId", "type", "sentAt"], ["status", "nextRetryAt"]],
  authlogs:          [["userId", "timestamp"], ["email", "event", "timestamp"], ["ip", "event", "timestamp"]],
  auditlogs:         [["clinicId", "timestamp"], ["userId", "timestamp"], ["resource", "resourceId", "timestamp"]],
};

async function main() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI not set");
    process.exit(1);
  }

  console.log("\n─────────────────────────────────────────");
  console.log("  JL Dental — Index Verification");
  console.log("─────────────────────────────────────────\n");

  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db!;

  let allGood = true;

  for (const [collection, requiredIndexes] of Object.entries(REQUIRED_INDEXES)) {
    try {
      const indexes = await db.collection(collection).indexes();
      const existingKeys = indexes.map((idx) => Object.keys(idx.key).filter((k) => k !== "_id"));

      console.log(`\n📋 ${collection}:`);
      for (const required of requiredIndexes) {
        const exists = existingKeys.some(
          (existing) => required.every((field) => existing.includes(field))
        );
        const status = exists ? "✅" : "❌ MISSING";
        console.log(`   ${status}  [${required.join(", ")}]`);
        if (!exists) allGood = false;
      }
    } catch {
      console.log(`   ⚠️  Collection "${collection}" not found (may not exist yet)`);
    }
  }

  console.log("\n─────────────────────────────────────────");
  if (allGood) {
    console.log("  ✅ All indexes verified");
  } else {
    console.log("  ❌ Some indexes missing — run the app once to auto-create via Mongoose");
  }
  console.log("─────────────────────────────────────────\n");

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("❌ Verification failed:", err);
  process.exit(1);
});
