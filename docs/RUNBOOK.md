# Operations Runbook — JL Dental Platform

## 1. Smoke test (run after every deploy — ~10 minutes)

Public:
- [ ] Homepage renders with hero, services, doctors sections
- [ ] `/services`, `/doctors`, `/blog`, `/faq`, `/gallery`, `/contact` load
- [ ] `/book`: submit a real test booking → success screen shows a reference number
- [ ] `/api/health` → 200 `{"status":"healthy"}`

Admin (`/admin`):
- [ ] Login works; wrong password rejected
- [ ] Dashboard shows the test booking under "Awaiting Confirmation"
- [ ] Open it → approve with confirmed date/time → status updates
- [ ] Patient email received (and WhatsApp, if configured)
- [ ] Upload an image on a doctor profile → appears on the public site
- [ ] Edit homepage hero text → public homepage reflects it

## 2. Rollback (bad deploy)
Vercel → Deployments → previous good deployment → **⋯ → Promote to Production**. Instant, no rebuild.
- Code is stateless; DB schema changes are additive by design — old code runs safely against newer data.
- If a deploy wrote bad *data*, fix via admin UI; restore from backup (§3) only as last resort.

## 3. Backup & restore (MongoDB Atlas)
- **M2+ tiers:** enable Cloud Backup, daily snapshot, 7-day retention. Restore via Atlas UI → "Restore" to a point in time.
- **M0 (no cloud backup):** schedule from any machine/cron:
  `mongodump --uri="$MONGODB_URI" --archive=jl-dental-$(date +%F).gz --gzip`
  Restore: `mongorestore --uri="$MONGODB_URI" --archive=<file> --gzip --drop`
- Test a restore into a scratch database **once before launch** — an untested backup is not a backup.
- Media lives in Cloudinary (independent durability); backups only need MongoDB.

## 4. Incident basics
| Symptom | First checks |
|---|---|
| Site down / 500s | Vercel status page → Deployment logs → roll back (§2) |
| `/api/health` shows `database: error` | Atlas status → cluster metrics → connection count; Atlas paused clusters (M0 auto-pause) resume on traffic |
| Emails not arriving | Resend dashboard → logs; check domain verification; spam folder |
| WhatsApp not sending | Function logs for `[WhatsApp]` lines: `no_provider_configured` = env vars missing; Meta error = check template approval status + token expiry |
| Bookings spam | Rate limit is 3/hr/IP; tighten in `lib/security/rate-limit.ts` (`limiters.appointments`); honeypot already active |
| Admin locked out | Re-run seed script with a new password (overwrites by email), or reset via `forgot-password` if email works |

## 5. Routine maintenance
- **Weekly:** glance at pending bookings/reviews (dashboard), Vercel error logs
- **Monthly:** `npm audit` locally; update dependencies on a branch, let CI verify, deploy
- **Quarterly:** restore-test a backup (§3); rotate `JWT_SECRET` if staff changed (logs everyone out)

## 6. Secrets hygiene
- All secrets live only in Vercel env vars — never in the repo (CI enforces builds without them via `SKIP_ENV_VALIDATION`)
- Rotation: change in Vercel → redeploy. `JWT_SECRET` rotation invalidates all sessions (intended)
- If a secret leaks: rotate at the provider first (Atlas user password / Resend key / Cloudinary secret), then update Vercel
