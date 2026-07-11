# Deployment Guide — JL Dental Platform

One-time setup, in order. Budget ~2 hours for accounts + first deploy.

## 0. Prerequisites
- GitHub account (repo for this codebase)
- Vercel account (free Hobby tier is fine to start)
- MongoDB Atlas account (M0 free tier is fine to start)
- Cloudinary account (free tier)
- Resend account (free tier: 100 emails/day) + a domain you control for sending
- Optional for WhatsApp: Meta Business account (see §6)

## 1. Git & GitHub
```bash
cd jl-dental
git init && git add -A && git commit -m "JL Dental platform — initial import"
git branch -M main
git remote add origin git@github.com:<you>/jl-dental.git
git push -u origin main
```
CI (`.github/workflows/ci.yml`) runs automatically: typecheck, lint, unit tests,
**the 15 FLOW integration tests against real MongoDB**, brand check, build.
A green first run closes the deferred Phase 6.2E certification — keep that run's URL.

## 2. MongoDB Atlas
1. Create cluster (M0, region **Mumbai `ap-south-1`** — matches Vercel `bom1`).
2. Database user: least-privilege `readWrite` on database `jl-dental` only.
3. Network access: allow `0.0.0.0/0` (Vercel egress IPs are dynamic; auth + TLS protect access).
4. Copy the connection string; set the database name in the path: `.../jl-dental?retryWrites=true&w=majority`.
5. Enable backups: M0 has none — **upgrade to M2+ or schedule `mongodump` before real patient data arrives** (see RUNBOOK §3).

## 3. Cloudinary
1. Note cloud name, API key, API secret (Dashboard → Settings → Access Keys).
2. No preset configuration needed — uploads go through the app's `/api/uploads` (signed, server-side).

## 4. Resend
1. Add + verify your sending domain (DNS records shown in dashboard).
2. Create API key. Set `EMAIL_FROM` to an address on the verified domain (e.g. `appointments@jldental.in`).

## 5. Vercel
1. Import the GitHub repo. Root directory: leave as repository root (`vercel.json` handles the monorepo).
2. Environment variables (Production + Preview) — from `apps/web/.env.example`:

   | Variable | Notes |
   |---|---|
   | `MONGODB_URI` | Atlas string from §2 |
   | `JWT_SECRET` | `openssl rand -base64 48` |
   | `JWT_EXPIRY` | `7d` |
   | `CLOUDINARY_CLOUD_NAME` / `_API_KEY` / `_API_SECRET` | §3 |
   | `RESEND_API_KEY` / `EMAIL_FROM` | §4 |
   | `UPSTASH_REDIS_REST_URL` / `_TOKEN` | create free DB at upstash.com |
   | `CRON_SECRET` | `openssl rand -hex 16` |
   | `NEXT_PUBLIC_APP_URL` | final URL, e.g. `https://jldental.in` |
   | `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | same as cloud name |
   | WhatsApp vars | leave unset until §6 |

3. Deploy. First deploy = staging validation: run the smoke pass (RUNBOOK §1) on the `*.vercel.app` URL **before** attaching the domain.
4. Seed the first admin: `MONGODB_URI=<prod-uri> npx tsx apps/web/scripts/seed-admin.ts` from your machine, then **log in and change the password immediately**.
5. Attach the domain; Vercel provisions TLS automatically. HSTS is already set by the app.

## 6. WhatsApp confirmations (optional — app no-ops safely without it)
1. Meta Business Suite → WhatsApp → add a business phone number (must not be registered on the consumer app).
2. Create a message template named `appointment_confirmed`, category *Utility*, body:
   `Hi {{1}}, your appointment at JL Dental Clinic is confirmed for {{2}} at {{3}}. See you soon!`
3. After approval (minutes–2 days), set `WHATSAPP_ACCESS_TOKEN` (permanent token via a System User) and `WHATSAPP_PHONE_NUMBER_ID` in Vercel, redeploy.
4. Test: approve a booking with your own phone number as the patient.

## 7. Post-deploy checklist
- [ ] `https://<domain>/api/health` returns `{"status":"healthy"}`
- [ ] Smoke pass complete (RUNBOOK §1)
- [ ] Uptime monitor pointed at `/api/health` (UptimeRobot free tier works)
- [ ] Vercel → Settings → Log Drains or enable Vercel's error observability; optionally add Sentry later
- [ ] Atlas backup strategy confirmed (§2.5)
- [ ] `robots.txt` + `sitemap.xml` reachable; submit sitemap in Google Search Console
