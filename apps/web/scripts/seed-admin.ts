#!/usr/bin/env tsx
/**
 * Admin seed script — CLI only, never exposed as an API route.
 *
 * Usage:
 *   npx tsx scripts/seed-admin.ts
 *   npx tsx scripts/seed-admin.ts --production   (requires explicit flag)
 *   npx tsx scripts/seed-admin.ts --force        (allow re-seed)
 *
 * Creates:
 *   1. Superadmin user account
 *   2. Default clinic document with safe defaults
 */
import "dotenv/config";
import mongoose    from "mongoose";
import bcrypt      from "bcryptjs";
import * as readline from "readline/promises";

// ─── Argument parsing ────────────────────────────────────────────────────────
const args        = process.argv.slice(2);
const isProduction = args.includes("--production");
const isForce      = args.includes("--force");

// ─── Environment guard ───────────────────────────────────────────────────────
if (process.env.NODE_ENV === "production" && !isProduction) {
  console.error("\n❌ Refusing to seed in production without --production flag.");
  console.error("   Run: npx tsx scripts/seed-admin.ts --production\n");
  process.exit(1);
}

// ─── Input helpers ───────────────────────────────────────────────────────────
const rl = readline.createInterface({
  input:  process.stdin,
  output: process.stdout,
});

async function prompt(question: string): Promise<string> {
  return rl.question(question);
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("❌ MONGODB_URI environment variable is not set.");
    process.exit(1);
  }

  console.log("\n🦷 JL Dental — Admin Seed Script");
  console.log("─".repeat(40));

  if (isProduction) {
    console.log("⚠️  Running in PRODUCTION mode\n");
    const confirm = await prompt("Type 'yes' to confirm production seed: ");
    if (confirm.trim().toLowerCase() !== "yes") {
      console.log("Aborted.");
      process.exit(0);
    }
  }

  // ─── Connect ───────────────────────────────────────────────────────────────
  console.log("\n📡 Connecting to MongoDB...");
  await mongoose.connect(mongoUri);
  console.log("✅ Connected");

  // ─── Dynamic model imports (after connection) ──────────────────────────────
  const { User }   = await import("../models/User");
  const { Clinic } = await import("../models/Clinic");

  // ─── Check existing superadmin ────────────────────────────────────────────
  const existingAdmin = await User.findOne({ role: "superadmin" }).lean();
  if (existingAdmin && !isForce) {
    console.log("\n⚠️  A superadmin account already exists.");
    console.log("   Email:", (existingAdmin as { email: string }).email);
    console.log("   Use --force to create another.\n");
    await cleanup();
    return;
  }

  // ─── Collect credentials ───────────────────────────────────────────────────
  console.log("\n👤 Create Superadmin Account");
  const name  = (await prompt("Name:  ")).trim();
  const email = (await prompt("Email: ")).trim().toLowerCase();

  if (!email.includes("@")) {
    console.error("❌ Invalid email address.");
    await cleanup();
    process.exit(1);
  }

  // Check for duplicate email
  const duplicate = await User.findOne({ email }).lean();
  if (duplicate) {
    console.error(`❌ Email ${email} is already registered.`);
    await cleanup();
    process.exit(1);
  }

  const password = await prompt("Password (min 8 chars): ");
  if (password.length < 8) {
    console.error("❌ Password must be at least 8 characters.");
    await cleanup();
    process.exit(1);
  }

  // ─── Hash password ────────────────────────────────────────────────────────
  console.log("\n🔐 Hashing password...");
  const passwordHash = await bcrypt.hash(password, 12);

  // ─── Create user ──────────────────────────────────────────────────────────
  const user = await User.create({
    name,
    email,
    passwordHash,
    role:         "superadmin",
    isActive:     true,
    tokenVersion: 0,
    authProvider: "local",
  });
  console.log(`✅ Superadmin created: ${user.email}`);

  // ─── Create default clinic ────────────────────────────────────────────────
  const existingClinic = await Clinic.findOne({ slug: "jl-dental" }).lean();
  if (!existingClinic) {
    await Clinic.create({
      slug: "jl-dental",
      name: "JL Dental Clinic",      // brand-ok — seed script cannot import @/config/branding
      contact: {
        phone:            "",
        whatsapp:         "",
        email:            "",
        address:          "Solan, Himachal Pradesh, India",
        mapEmbedUrl:      "",
        mapDirectionsUrl: "",
      },
      location: { latitude: 30.9045, longitude: 77.0967 }, // Solan, HP
      seo: {
        defaultTitle:       "JL Dental Clinic — Premium Dental Care in Solan", // brand-ok — seed script
        defaultDescription: "Expert dental care in Solan, Himachal Pradesh.",
      },
    });
    console.log("✅ Default clinic document created");
  } else {
    console.log("ℹ️  Clinic document already exists — skipped");
  }

  console.log("\n🎉 Seed complete!");
  console.log("─".repeat(40));
  console.log(`   Email:    ${email}`);
  console.log("   Role:     superadmin");
  console.log("   Login at: /admin/login\n");

  await cleanup();
}

async function cleanup() {
  rl.close();
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(async (err) => {
  console.error("❌ Seed failed:", err);
  rl.close();
  await mongoose.disconnect();
  process.exit(1);
});
