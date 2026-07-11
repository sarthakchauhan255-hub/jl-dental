# Phase 2 — Database & Core Models

## New Models Created
- AuthLog       — security audit trail, 90-day TTL, IP tracking
- AuditLog      — content action trail, activity feed source, 90-day TTL
- MediaPendingCleanup — orphan Cloudinary asset queue, 48-hour TTL
- PasswordResetToken  — secure single-use tokens, 1-hour TTL

## Upgraded Models
- User          — added tokenVersion, 2FA-ready, OAuth-ready, lastLoginAt
- Appointment   — full statusHistory[], confirmedDate/Time, reminderSent per type, future-ready nullable fields
- Clinic        — added workingHours, social links, favicon, location (lat/lng), galleryPreview section
- BlogPost      — added inlineImagePublicIds[] for complete Cloudinary cleanup on delete
- NotificationLog — added retry architecture: attemptCount, nextRetryAt, templateKey, appointmentId ref

## New Utilities
- lib/db.ts            — upgraded with health check, disconnectDB for scripts, proper error handling
- lib/cloudinary.ts    — complete upload/delete/deleteMany/validateUploadFile with magic byte check
- lib/audit.ts         — fire-and-forget audit + auth log service
- lib/db-helpers.ts    — assertDocument, isValidObjectId, buildSearchFilter, parsePagination
- lib/validations/index.ts — complete Zod schemas for all entities, inferred types exported

## New Feature Layer
- features/clinic/server/get-clinic.ts — in-memory cached clinic config with defaults fallback

## Scripts
- scripts/seed-admin.ts       — interactive CLI, creates superadmin + clinic document
- scripts/verify-indexes.ts   — pre-launch index verification against required list

## Models Barrel
- models/index.ts — centralized registration and type exports

## Index Coverage
All required indexes defined in models:
- Compound indexes for all common query patterns
- TTL indexes on AuthLog, AuditLog, NotificationLog (90 days), MediaPendingCleanup (48h)
- Unique indexes: User.email, Doctor.slug, Service.slug, BlogPost.slug, Clinic.slug
