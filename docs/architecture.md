# JL Dental — Architecture Reference

## Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui + Framer Motion
- **Database**: MongoDB Atlas via Mongoose
- **Auth**: JWT (jose) in httpOnly cookies
- **Media**: Cloudinary (server-side upload only)
- **Email**: Resend
- **WhatsApp**: Twilio abstraction (stub in v1)
- **Deployment**: Vercel (frontend+API) + MongoDB Atlas

## Critical Rules
1. Never expose API keys to the client
2. All media stored as Cloudinary URL + publicId pairs
3. Every model carries `clinicId` for future multi-clinic support
4. Auth validated at middleware AND API handler level (double layer)
5. All content CMS-driven — no hardcoded business content in code
6. Mobile-first responsive from day one

## Phases
- Phase 0: Foundation (current) ✅
- Phase 1: Auth system
- Phase 2: Clinic CMS module
- Phase 3: Doctors module
- Phase 4: Services module
- Phase 5: Appointments
- Phase 6: Gallery
- Phase 7: Blog
- Phase 8: FAQ + Reviews
- Phase 9: Patient-facing UI
- Phase 10: Admin dashboard UI
- Phase 11: Notifications
- Phase 12: SEO layer
- Phase 13: Performance pass
- Phase 14: Deployment
