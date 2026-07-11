/**
 * Timezone utilities — all time operations use Asia/Kolkata (IST).
 * Never use raw Date methods for display — always go through these helpers.
 */
import { format, formatDistanceToNow, parseISO, isValid } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";

export const CLINIC_TIMEZONE = "Asia/Kolkata";

/**
 * Format a UTC date in IST for display.
 */
export function formatIST(
  date: Date | string,
  fmt: string = "dd MMM yyyy, h:mm a"
): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(d)) return "—";
  const zoned = toZonedTime(d, CLINIC_TIMEZONE);
  return format(zoned, fmt);
}

/**
 * Format date only (no time) in IST.
 */
export function formatDateIST(date: Date | string): string {
  return formatIST(date, "dd MMMM yyyy");
}

/**
 * Format time only in IST.
 */
export function formatTimeIST(date: Date | string): string {
  return formatIST(date, "h:mm a");
}

/**
 * Relative time ("2 hours ago") — always humanized.
 */
export function formatRelative(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(d)) return "—";
  return formatDistanceToNow(d, { addSuffix: true });
}

/**
 * Convert an IST date+time string to UTC Date for DB storage.
 * Use when accepting user input (date pickers, form fields).
 */
export function istToUtc(istDateString: string): Date {
  return fromZonedTime(istDateString, CLINIC_TIMEZONE);
}

/**
 * Get current time in IST as a Date object.
 */
export function nowIST(): Date {
  return toZonedTime(new Date(), CLINIC_TIMEZONE);
}

/**
 * Format a cron-friendly display for UI (IST context labels).
 */
export function formatForDigest(date: Date): string {
  return formatIST(date, "EEEE, dd MMMM yyyy");
}

/**
 * Get IST hour (0–23) from a UTC date — used for quiet hours logic.
 */
export function getISTHour(date: Date): number {
  const zoned = toZonedTime(date, CLINIC_TIMEZONE);
  return zoned.getHours();
}
