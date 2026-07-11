#!/usr/bin/env tsx
/**
 * Admin seed script — CLI only.
 *
 * Creates the initial superadmin account + default clinic document.
 * Run once during deployment setup:
 *   npx tsx scripts/seed-admin.ts
 *   npx tsx scripts/seed-admin.ts --production  (requires confirmation)
 *
 * NEVER expose this as an API route.
 */
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt   from "bcryptjs";
import readline from "readline";

// ─── Inline types to avoid importing from Next.js context ─────────────────────
const ROLES = ["superadmin", "admin", "receptionist", "content_manager", "doctor"] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function prompt(question: string, hidden = false): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input:  process.stdin,
      output: process.stdout,
    });

    if (hidden && process.stdout.isTTY) {
      process.stdout.write(question);
      process.stdin.setRawMode(true);
      let input = "";
      process.stdin.on("data", (char) => {
        const c = char.toString();
        if (c === "\r" || c === "\n") {
          process.stdin.setRawMode(false);
          process.stdout.write("\n");
          rl.close();
          resolve(input);
        } else if (c === "\u0003") {
          process.exit(1);
        } else if (c === "\u007f") {
          input = input.slice(0, -1);
        } else {
          input += c;
        }
      });
    } else {
      rl.question(question, (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    }
  });
}

function validate(email: string, password: string): string[] {
  const errors: string[] = [];
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("Invalid email format");
  if (password.length < 8) errors.push("Password must be at least 8 characters");
  if (!/[a-zA-Z]/.test(password)) errors.push("Password must contain at least one letter");
  if (!/\d/.test(password))       errors.push("Password must contain at least one number");
  return errors;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const isProduction = process.argv.includes("--production");
  const isForce      = process.argv.includes("--force");

  console.log("\n─────────────────────────────────────────");
  console.log("  JL Dental — Admin Seed Script");
  console.log("─────────────────────────────────────────\n");

  if (isProduction) {
    console.log("⚠️  PRODUCTION MODE — this will modify the production database.");
    const confirm = await prompt("Type 'yes' to continue: ");
    if (confirm !== "yes") {
      console.log("Aborted.");
      process.exit(0);
    }
  }

  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI environment variable is not set.");
    console.error("   Create a .env file or set the variable before running.");
    process.exit(1);
  }

  // ─── Collect credentials ────────────────────────────────────────────────────
  console.log("Enter the superadmin account details:\n");
  const name     = await prompt("Full name: ");
  const email    = await prompt("Email: ");
  const password = await prompt("Password (hidden): ", true);
  const confirm  = await prompt("Confirm password (hidden): ", true);

  if (password !== confirm) {
    console.error("\n❌ Passwords do not match.");
    process.exit(1);
  }

  const errors = validate(email, password);
  if (errors.length) {
    console.error("\n❌ Validation errors:");
    errors.forEach((e) => console.error(`   • ${e}`));
    process.exit(1);
  }

  // ─── Connect ────────────────────────────────────────────────────────────────
  console.log("\nConnecting to database...");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected.");

  // ─── Dynamic model definitions (avoid Next.js import context) ────────────────
  const UserSchema = new mongoose.Schema({
    clinicId:         { type: mongoose.Schema.Types.ObjectId, default: null },
    name:             { type: String, required: true },
    email:            { type: String, required: true, unique: true, lowercase: true },
    passwordHash:     { type: String, required: true },
    role:             { type: String, default: "superadmin" },
    isActive:         { type: Boolean, default: true },
    tokenVersion:     { type: Number, default: 0 },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret:  { type: String, default: null },
    authProvider:     { type: String, default: "local" },
    lastLoginAt:      { type: Date, default: null },
  }, { timestamps: true });

  const ClinicSchema = new mongoose.Schema({
    slug:    { type: String, required: true, unique: true },
    name:    { type: String, required: true },
    isActive:{ type: Boolean, default: true },
    contact: {
      phone: String, whatsapp: String, email: String,
      address: String, mapEmbedUrl: String, mapDirectionsUrl: String,
    },
    location: { latitude: Number, longitude: Number },
    seo: { defaultTitle: String, defaultDescription: String },
    homepage: {
      hero: {
        headline: { type: String, default: "Your Smile, Our Expertise" },
        subheadline: { type: String, default: "Premium dental care in Solan, Himachal Pradesh." },
        ctaLabel: { type: String, default: "Book Appointment" },
        ctaHref:  { type: String, default: "/appointments" },
      },
    },
  }, { timestamps: true });

  const UserModel   = mongoose.models["User"]   ?? mongoose.model("User",   UserSchema);
  const ClinicModel = mongoose.models["Clinic"] ?? mongoose.model("Clinic", ClinicSchema);

  // ─── Check existing ──────────────────────────────────────────────────────────
  const existing = await UserModel.findOne({ email: email.toLowerCase() });
  if (existing && !isForce) {
    console.error(`\n❌ User with email "${email}" already exists.`);
    console.error("   Use --force to overwrite (will update password and role).");
    await mongoose.disconnect();
    process.exit(1);
  }

  // ─── Create or update admin ──────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash(password, 12);

  if (existing && isForce) {
    await UserModel.updateOne(
      { email: email.toLowerCase() },
      { $set: { name, passwordHash, role: "superadmin", isActive: true, tokenVersion: (existing.tokenVersion ?? 0) + 1 } }
    );
    console.log(`\n✅ Updated existing user: ${email}`);
  } else {
    // ─── Create clinic if none exists ─────────────────────────────────────────
    let clinic = await ClinicModel.findOne({ slug: "jl-dental" });
    if (!clinic) {
      clinic = await ClinicModel.create({
        slug:  "jl-dental",
        name:  "JL Dental Clinic",
        seo: {
          defaultTitle:       "JL Dental Clinic — Premium Dental Care in Solan",
          defaultDescription: "Expert dental care in Solan, Himachal Pradesh.",
        },
      });
      console.log(`\n✅ Created default clinic: JL Dental Clinic (id: ${clinic._id})`);
    } else {
      console.log(`\nℹ️  Clinic already exists: ${clinic.name}`);
    }

    await UserModel.create({
      clinicId:     clinic._id,
      name,
      email:        email.toLowerCase(),
      passwordHash,
      role:         "superadmin",
    });
    console.log(`✅ Created superadmin: ${email}`);
  }

  // ─── Summary ─────────────────────────────────────────────────────────────────
  console.log("\n─────────────────────────────────────────");
  console.log("  Seed complete. Next steps:");
  console.log("  1. Start the dev server: npm run dev");
  console.log("  2. Login at: /admin/login");
  console.log(`  3. Email: ${email}`);
  console.log("─────────────────────────────────────────\n");

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("\n❌ Seed failed:", err);
  process.exit(1);
});
