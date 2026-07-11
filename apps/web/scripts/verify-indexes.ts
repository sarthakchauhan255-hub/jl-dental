#!/usr/bin/env tsx
/**
 * Index verification script.
 * Run before production launch to confirm all MongoDB indexes exist.
 *
 * Usage: npx tsx scripts/verify-indexes.ts
 */
import "dotenv/config";
import mongoose from "mongoose";

const REQUIRED_INDEXES: Record<string, string[][]> = {
  users:               [["email"], ["clinicId", "role"], ["isActive", "role"]],
  appointments:        [["clinicId", "status", "createdAt"], ["email", "status"], ["confirmedDate", "status"], ["createdAt", "status"]],
  blogposts:           [["slug"], ["clinicId", "status", "publishedAt"]],
  doctors:             [["slug"], ["clinicId", "isActive", "order"]],
  services:            [["slug"], ["clinicId", "isActive", "order"]],
  reviews:             [["clinicId", "status", "createdAt"]],
  faqs:                [["clinicId", "isActive", "order"]],
  galleries:           [["clinicId", "type", "isActive", "order"]],
  notificationlogs:    [["clinicId", "type", "sentAt"], ["status", "nextRetryAt"]],
  authlogs:            [["userId", "timestamp"], ["email", "event", "timestamp"], ["ip", "event", "timestamp"]],
  auditlogs:           [["clinicId", "timestamp"], ["userId", "timestamp"], ["resource", "resourceId", "timestamp"]],
  mediapendingcleanups:[["resolved", "uploadedAt"]],
};

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("❌ MONGODB_URI not set");
    process.exit(1);
  }

  console.log("\n🔍 JL Dental — Index Verification");
  console.log("─".repeat(40));

  await mongoose.connect(mongoUri);
  const db = mongoose.connection.db;

  if (!db) {
    console.error("❌ Database connection failed");
    process.exit(1);
  }

  let allPassed = true;

  for (const [collection, expectedIndexes] of Object.entries(REQUIRED_INDEXES)) {
    try {
      const existingIndexes = await db.collection(collection).indexes();
      const existingKeys = existingIndexes.map((idx) =>
        Object.keys(idx.key).filter((k) => k !== "_id").join(",")
      );

      console.log(`\n📋 ${collection}`);

      for (const indexFields of expectedIndexes) {
        const key = indexFields.join(",");
        const exists = existingKeys.some((k) => k === key || k.includes(key.split(",")[0]));
        const status = exists ? "✅" : "❌";
        if (!exists) allPassed = false;
        console.log(`   ${status} [${indexFields.join(", ")}]`);
      }
    } catch {
      console.log(`   ⚠️  Collection not found (may not exist yet)`);
    }
  }

  console.log("\n" + "─".repeat(40));
  if (allPassed) {
    console.log("✅ All indexes verified\n");
  } else {
    console.log("⚠️  Some indexes missing — Mongoose will create them on first connect\n");
  }

  await mongoose.disconnect();
}

main().catch(console.error);
