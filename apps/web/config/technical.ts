/**
 * Technical identifiers — environment-independent infrastructure constants.
 *
 * Separation rule:
 *   config/branding.ts  → what users and patients SEE (names, copy, colors)
 *   config/technical.ts → what the system USES (slugs, prefixes, service IDs)
 *
 * Brand changes must never require touching infrastructure.
 * Infrastructure changes must never require touching brand copy.
 */

export const TECH = {
  /** Kebab-case application slug. Used as: DB name prefix, Cloudinary root folder,
   *  logger service identifier, default clinic document slug. */
  APP_SLUG:             "jl-dental",

  /** Cloudinary root folder. All media paths begin with this prefix. */
  CLOUDINARY_PREFIX:    "jl-dental",

  /** Default upload tag applied to every Cloudinary upload. */
  DEFAULT_UPLOAD_TAG:   "jl-dental",

  /** Default MongoDB document slug for the primary clinic. */
  DEFAULT_CLINIC_SLUG:  "jl-dental",

  /** Local dev database name suffix — produces `jl-dental-dev`. */
  DB_DEFAULT_SUFFIX:    "dev",

  /** Logger service identifier — appears in structured JSON log output. */
  LOGGER_SERVICE_NAME:  "jl-dental",

  /** Resend email sender name — used as the "From:" display name in outbound email. */
  EMAIL_FROM_NAME:      "JL Dental",
} as const;
