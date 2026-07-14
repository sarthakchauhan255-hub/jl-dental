import type { Metadata }      from "next";
import { redirect }           from "next/navigation";
import Link                   from "next/link";
import { getAuthUser }        from "@/lib/auth/session";
import { hasPermission }      from "@/lib/auth/rbac";
import { connectDB }          from "@/lib/db/connection";
import { PageHeader }         from "@/components/cms/page-header";
import { HomepageSettingsForm, type HomepageValue } from "@/features/clinic/components/homepage-settings-form";
import { fallbackHomepageSections } from "@/features/shared/cms/fallback/fallback-data";
import { mapClinic }          from "@/lib/db/mappers";
import { TECH }               from "@/config/technical";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Homepage | Admin", robots: { index: false, follow: false } };

export default async function HomepageSettingsPage() {
  const user = await getAuthUser();
  if (!user || !hasPermission(user.role, "clinic.update")) redirect("/admin/dashboard");

  await connectDB();
  const { Clinic } = await import("@/models/Clinic");
  const raw = await Clinic.findOne({ slug: TECH.DEFAULT_CLINIC_SLUG }).lean();
  const clinic = raw ? mapClinic(raw) : null;
  const hp = (clinic?.homepage ?? {}) as Partial<HomepageValue>;
  const fb = fallbackHomepageSections;

  // Merge stored values over fallbacks so the form always has complete data.
  // Fallback section types are unions with unknown — normalize field-by-field.
  const fbAny = fb as unknown as HomepageValue;
  const initial: HomepageValue = {
    hero: {
      headline:    hp.hero?.headline    ?? fbAny.hero.headline,
      subheadline: hp.hero?.subheadline ?? fbAny.hero.subheadline,
      ctaLabel:    hp.hero?.ctaLabel    ?? fbAny.hero.ctaLabel,
      ctaHref:     hp.hero?.ctaHref     ?? fbAny.hero.ctaHref,
      image:       hp.hero?.image       ?? null,
    },
    servicesPreview: { ...fbAny.servicesPreview, ...(hp.servicesPreview ?? {}) },
    doctorsPreview:  { ...fbAny.doctorsPreview,  ...(hp.doctorsPreview ?? {}) },
    testimonials:    { ...fbAny.testimonials,    ...(hp.testimonials ?? {}) },
    ctaBlock:        { ...fbAny.ctaBlock,        ...(hp.ctaBlock ?? {}) },
    faqPreview:      { ...fbAny.faqPreview,      ...(hp.faqPreview ?? {}) },
    galleryPreview:  { ...fbAny.galleryPreview,  ...(hp.galleryPreview ?? {}) },
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Homepage Content"
        description="Hero, section headings and visibility for the public homepage."
        breadcrumb={
          <Link href="/admin/clinic" className="text-sm text-charcoal-500 hover:text-charcoal-800">
            ← Clinic Settings
          </Link>
        }
      />
      <HomepageSettingsForm initial={initial} />
    </div>
  );
}
