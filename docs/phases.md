# JL Dental — Canonical Phase Ordering

This file is the authoritative reference for implementation phases.
Do not reorder or skip phases without explicit approval.

---

## Phase 0 — Project Scaffold ✅
- Next.js 14 app initialization
- Tailwind CSS configuration
- shadcn/ui primitives
- Environment validation (t3-env)
- Folder structure
- Base Cloudinary + DB + auth utilities
- ESLint / Prettier

## Phase 1 — Foundation Architecture ✅
- Complete type system
- Design token system (Tailwind + CSS vars)
- Motion token centralization
- UI primitive components (Button, Card, Badge, Input, etc.)
- Common components (Section, Container, Spinner, OptimizedImage, Motion)
- State components (EmptyState, ErrorState, LoadingState)
- Feature folder skeleton (12 feature domains)
- Error class system
- Async route wrapper
- Logger abstraction
- Constants layer (routes, roles, statuses, SEO)
- Middleware (admin + cron protection, composable)
- 404 / 500 pages

## Phase 1 Adjustments ✅
- Self-hosted fonts via next/font/local
- Motion token centralization
- Server/client boundary audit
- Tailwind token verification
- Data table skeleton

## Phase 2 — Database & Core Models ✅
- All Mongoose models (User, Clinic, Doctor, Service, BlogPost, Gallery, FAQ, Review, Appointment)
- System models (AuthLog, AuditLog, NotificationLog, MediaPendingCleanup, PasswordResetToken)
- Models barrel export
- DB connection (singleton, serverless-safe)
- Cloudinary server utility (upload, delete, magic-byte validation)
- Audit logging service
- DB helper utilities
- Clinic config server service
- Zod validation schemas (all entities)
- Admin seed script
- Index verification script

## Phase 3 — Authentication & Security 🔄 NEXT
- Login API route
- Logout API route
- Session API (me endpoint)
- Password reset (request + confirm)
- Password change (authenticated)
- tokenVersion invalidation on password change/reset
- AuthLog integration on all auth events
- Upstash rate limiting (IP + email, login endpoint)
- bcrypt rounds = 12
- Secure reset token hashing (crypto.randomBytes + bcrypt)
- Session invalidation on password change
- Generic error messages (no user enumeration)
- CSRF-safe via SameSite=Strict cookie + origin check
- Admin login page (full UI)
- Admin layout shell (sidebar nav)
- Auth context (client-side session state)

## Phase 4 — CMS Foundation
- Media upload API (server-side Cloudinary, validated)
- Media delete API
- Orphan cleanup cron stub
- Clinic config GET/PATCH API
- Services CRUD API
- Doctors CRUD API
- FAQ CRUD API
- Gallery CRUD API (before/after + general)
- Blog CRUD API (with rich text content handling)
- Reviews CRUD API (moderation)
- ISR revalidation triggers per module

## Phase 5 — Public Website
- Homepage (CMS-driven, all sections)
- Navbar (transparent → solid scroll, mobile drawer)
- Footer (links, contact, social)
- Services list + detail pages
- Doctors list + profile pages
- Gallery page (before/after slider, lightbox)
- Blog list + post pages (rich text renderer)
- FAQ page (accordion, structured data)
- Contact page (map embed, working hours)
- Appointment booking form
- WhatsApp floating button
- SEO metadata per page
- JSON-LD structured data per page
- sitemap.xml + robots.txt
- Framer Motion scroll reveals

## Phase 6 — Appointment System
- Appointment submission API (rate-limited, honeypot)
- Appointment admin list API (filtered, paginated)
- Appointment detail + status update API
- Status transition validation (state machine)
- statusHistory appended on every transition
- Duplicate detection (same email + date + pending)
- Admin appointment dashboard UI
- Appointment detail slide-over panel
- Calendar view (weekly)
- Table view (default, sortable)
- Status update workflow (approve/reject/complete/no-show)

## Phase 7 — Notifications
- Resend email integration
- Email template system (all 8 patient templates + 2 admin templates)
- WhatsApp service (stub logs, Twilio-ready)
- Notification logging (every send attempt)
- Retry architecture (cron scans failed, 3 attempts)
- Vercel Cron jobs:
  - appointment-reminders (hourly)
  - appointment-reminders-2h (every 30 min)
  - appointment-expiry (every 6h)
  - admin-daily-digest (9 AM IST)
  - post-visit-followup (hourly)
  - orphan-media-cleanup (hourly)

## Phase 8 — Analytics & Reporting
- Admin dashboard page (metrics, pipeline, activity feed)
- Appointment analytics (approval rate, response time, trends)
- Review analytics (rating distribution, reputation health)
- Blog analytics (publish count, draft nudges)
- Notification delivery analytics
- Recharts trend charts
- CSV export (appointments + reviews)
- Data table implementation

## Phase 9 — Production Hardening
- Error states on all public pages
- Empty states on all admin lists
- Accessibility pass (focus states, aria, keyboard nav)
- SEO audit (all pages have metadata, canonical, OG)
- Lighthouse optimization (target: Performance ≥ 85, SEO = 100)
- Security audit (headers, cookie flags, rate limits)
- Cron job manual testing
- Pre-launch checklist execution
- Deployment to Vercel + Atlas + Cloudinary production
- Domain configuration
- Resend domain verification (SPF/DKIM/DMARC)

---

## Rules
1. Phases are sequential — do not start Phase N+1 until Phase N is approved
2. Each phase delivery includes: files list, build verification, TypeScript clean
3. Specification conflicts surface immediately — no silent deviations
4. No new abstractions without a live use case in the current phase
5. Middleware stays thin — no DB work, no heavy logic
6. Every model change is backward-compatible (additive only)
