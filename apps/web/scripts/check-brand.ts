#!/usr/bin/env tsx
/**
 * Brand lock validator — CI-ready.
 *
 * Separates display branding (config/branding.ts) from infrastructure (config/technical.ts).
 * Detects display brand literals that must ONLY live in config/branding.ts.
 * Infrastructure identifiers in config/technical.ts are explicitly allowed.
 *
 * Exit: 0 = clean, 1 = violations found.
 * Escape hatch: "// brand-ok" on a line suppresses that occurrence.
 */
import { execSync } from "child_process";
import path         from "path";

const ROOT = path.resolve(__dirname, "..");

// Directories to scan — extended in 5.2 (config/providers/hooks), 5.3 (scripts)
const SCAN_DIRS = [
  "app", "features", "lib", "components",
  "constants", "context", "config", "providers", "hooks", "scripts",
];

// Scripts excluded — they run outside Next.js and can't import env.ts / branding.ts
const EXCLUDED_FILES = new Set([
  "config/branding.ts",    // source of truth for display brand
  "config/technical.ts",   // source of truth for infra identifiers
  "scripts/check-brand.ts", // this file
]);

interface Category {
  name: string;
  term: string;
  note: string;
}

// Display brand literals that must come from config/branding.ts
const DISPLAY_CATEGORIES: Category[] = [
  { name: "clinic_name",   term: "JL Dental Clinic",              note: "use BRAND.NAME" },
  { name: "admin_title",   term: "JL Dental Admin",               note: "use BRAND.ADMIN_LABEL" },
  { name: "whatsapp_msg",  term: "like to book an appointment at", note: "use BRAND.WHATSAPP_MSG" },
  { name: "support_email", term: "admin@jldental.com",            note: "use BRAND.SUPPORT_EMAIL" },
  { name: "og_title",      term: "Premium Dental Care in Solan",  note: "use BRAND.DEFAULT_TITLE" },
];

let totalViolations = 0;

for (const cat of DISPLAY_CATEGORIES) {
  let raw = "";
  try {
    raw = execSync(
      `grep -rn "${cat.term}" ${SCAN_DIRS.join(" ")} --include="*.ts" --include="*.tsx" 2>/dev/null || true`,
      { cwd: ROOT, encoding: "utf8" }
    );
  } catch { continue; }

  for (const line of raw.split("\n").filter(Boolean)) {
    const file = line.split(":")[0];

    if (EXCLUDED_FILES.has(file)) continue;
    if (line.includes("// brand-ok")) continue;

    // Next.js: template literals forbidden in `export const metadata` in server pages
    if (file.includes("(admin)") && line.includes("title:")) continue;

    console.error(`[${cat.name}] ${cat.note}\n  ${line}\n`);
    totalViolations++;
  }
}

if (totalViolations === 0) {
  console.log("✅ Brand check passed — no display brand literals outside config/branding.ts");
  console.log(`   Scanned: ${SCAN_DIRS.join(", ")}`);
  console.log(`   Categories: ${DISPLAY_CATEGORIES.map(c => c.name).join(", ")}`);
} else {
  console.error(`❌ ${totalViolations} violation(s). Fix: import BRAND from "@/config/branding".`);
  process.exit(1);
}
