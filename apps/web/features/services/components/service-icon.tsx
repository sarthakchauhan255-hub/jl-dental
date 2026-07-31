import {
  Activity, Target, Ruler, Sparkles, Zap, Smile, ShieldCheck, Sun,
  Crown, HeartPulse, ScanLine, Baby, Stethoscope, Syringe, Pill,
  type LucideIcon,
} from "lucide-react";

/**
 * Maps a service's `icon` string (set per service in Admin → Services) to a
 * Lucide icon. Unknown or empty values fall back to a neutral default.
 *
 * Valid icon names:
 *   activity (root canal), implant, braces (straightening), reshape (cosmetic),
 *   laser, wisdom (extraction), cleaning, whitening, crown (crowns/bridges),
 *   gum (periodontal), xray, pediatric, checkup, filling, medication
 */
const SERVICE_ICONS: Record<string, LucideIcon> = {
  activity:   Activity,
  implant:    Target,
  braces:     Ruler,
  reshape:    Sparkles,
  laser:      Zap,
  wisdom:     Smile,
  cleaning:   ShieldCheck,
  whitening:  Sun,
  crown:      Crown,
  gum:        HeartPulse,
  xray:       ScanLine,
  pediatric:  Baby,
  checkup:    Stethoscope,
  filling:    Syringe,
  medication: Pill,
};

const DEFAULT_ICON: LucideIcon = Sparkles;

export function resolveServiceIcon(name?: string): LucideIcon {
  if (!name) return DEFAULT_ICON;
  return SERVICE_ICONS[name.trim().toLowerCase()] ?? DEFAULT_ICON;
}

export function ServiceIcon({ name, className }: { name?: string; className?: string }) {
  const Icon = resolveServiceIcon(name);
  return <Icon className={className} strokeWidth={1.6} aria-hidden="true" />;
}
