import type { Metadata } from "next";
import Link              from "next/link";
import {
  Settings, UserRound, Stethoscope, Images,
  FileText, HelpCircle, Star, LayoutDashboard, Calendar,
} from "lucide-react";
import { PageHeader }     from "@/components/cms/page-header";
import { SectionCard }    from "@/components/cms/section-card";
import { getAuthUser }    from "@/lib/auth/session";
import { hasPermission }   from "@/lib/auth/rbac";
import { connectDB }       from "@/lib/db/connection";
import { mapAppointmentList } from "@/lib/db/mappers";
import { BRAND }          from "@/config/branding";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Dashboard | Admin",
  robots: { index: false, follow: false },
};

const MODULES = [
  { title: "Clinic Settings",  href: "/admin/clinic",    icon: Settings,      desc: "Name, contact, hours, social" },
  { title: "Doctors",          href: "/admin/doctors",   icon: UserRound,     desc: "Profiles, specializations, bios" },
  { title: "Services",         href: "/admin/services",  icon: Stethoscope,   desc: "Treatments and descriptions" },
  { title: "Gallery",          href: "/admin/gallery",   icon: Images,        desc: "Before/after and general photos" },
  { title: "Blog",             href: "/admin/blog",      icon: FileText,      desc: "Articles and news posts" },
  { title: "FAQ",              href: "/admin/faq",       icon: HelpCircle,    desc: "Questions and answers" },
  { title: "Reviews",          href: "/admin/reviews",   icon: Star,          desc: "Patient testimonials" },
  { title: "Appointments",      href: "/admin/appointments", icon: Calendar,    desc: "Booking requests" },
];

async function getDashboardStats() {
  try {
    await connectDB();
    const [{ Appointment }, { Doctor }, { Service }, { BlogPost }, { Review }] = await Promise.all([
      import("@/models/Appointment"), import("@/models/Doctor"),
      import("@/models/Service"), import("@/models/BlogPost"), import("@/models/Review"),
    ]);
    const [pendingAppts, pendingReviews, doctors, services, drafts, recentRaw] = await Promise.all([
      Appointment.countDocuments({ status: "pending" }),
      Review.countDocuments({ status: "pending" }),
      Doctor.countDocuments({ isActive: true }),
      Service.countDocuments({ isActive: true }),
      BlogPost.countDocuments({ status: "draft" }),
      Appointment.find({ status: "pending" }).sort({ createdAt: -1 }).limit(5).lean(),
    ]);
    return {
      pendingAppts, pendingReviews, doctors, services, drafts,
      recent: recentRaw.map(mapAppointmentList),
    };
  } catch {
    return null; // DB unreachable — dashboard still renders module grid
  }
}

export default async function DashboardPage() {
  const user  = await getAuthUser();
  const stats = await getDashboardStats();
  const canSeeAppointments = user ? hasPermission(user.role, "appointments.read") : false;

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        icon={LayoutDashboard}
        title="Dashboard"
        description={`Welcome back${user?.name ? `, ${user.name}` : ""}. Manage ${BRAND.NAME} content.`}
      />

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          {[
            { label: "Pending Bookings", value: stats.pendingAppts,  href: "/admin/appointments", highlight: stats.pendingAppts > 0 },
            { label: "Pending Reviews",  value: stats.pendingReviews, href: "/admin/reviews",     highlight: stats.pendingReviews > 0 },
            { label: "Active Doctors",   value: stats.doctors,        href: "/admin/doctors" },
            { label: "Active Services",  value: stats.services,       href: "/admin/services" },
            { label: "Draft Posts",      value: stats.drafts,         href: "/admin/blog" },
          ].map(s => (
            <Link key={s.label} href={s.href}
              className={`rounded-xl border p-4 transition-colors hover:border-primary-300 ${s.highlight ? "border-primary-300 bg-primary-50" : "border-border bg-white"}`}>
              <div className="text-2xl font-semibold text-charcoal-900">{s.value}</div>
              <div className="text-xs text-charcoal-500 mt-0.5">{s.label}</div>
            </Link>
          ))}
        </div>
      )}

      {stats && canSeeAppointments && stats.recent.length > 0 && (
        <SectionCard title="Awaiting Confirmation" description="Newest booking requests — approve or reject from the detail page.">
          <ul className="divide-y divide-border">
            {stats.recent.map(a => (
              <li key={a.id}>
                <Link href={`/admin/appointments/${a.id}`}
                  className="flex items-center justify-between gap-4 py-2.5 hover:bg-cream-50 -mx-2 px-2 rounded-md transition-colors">
                  <div className="min-w-0">
                    <span className="block truncate text-sm font-medium text-charcoal-900">{a.patientName}</span>
                    <span className="block text-xs text-charcoal-500">{a.preferredDate} · {a.preferredTime}</span>
                  </div>
                  <span className="shrink-0 text-xs text-primary-600">Review →</span>
                </Link>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {MODULES.map((mod) => {
          const Icon = mod.icon;
          return (
            <Link
              key={mod.href}
              href={mod.href}
              className="group flex flex-col gap-3 rounded-xl border border-border bg-white p-5 hover:border-primary-300 hover:shadow-sm transition-all"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 group-hover:bg-primary-100 transition-colors">
                <Icon className="h-5 w-5 text-primary-700" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium text-charcoal-900">{mod.title}</p>
                <p className="mt-0.5 text-xs text-charcoal-500">{mod.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
