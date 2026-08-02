import type { Metadata } from "next";
import type { ComponentType } from "react";
import Link from "next/link";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Section } from "@/components/common/section";
import { Reveal }  from "@/components/common/motion";
import { GoogleReviewButton } from "@/components/common/google-review-button";
import { InstagramIcon, FacebookIcon, WhatsAppIcon, GoogleIcon } from "@/components/icons/social";
import { getCmsProvider } from "@/features/shared/cms";
import { resolveMetadata } from "@/lib/seo";
import { REVALIDATE }     from "@/lib/cache";
import { BRAND } from "@/config/branding";
import type { ClinicPublicContent } from "@/features/clinic/schemas/clinic-public.schema";

export const revalidate = REVALIDATE.contact;

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;
const DAY_LABELS: Record<(typeof DAYS)[number], string> = {
  monday: "Monday", tuesday: "Tuesday", wednesday: "Wednesday", thursday: "Thursday",
  friday: "Friday", saturday: "Saturday", sunday: "Sunday",
};

export async function generateMetadata(): Promise<Metadata> {
  return resolveMetadata({
    path: "/contact",
    entityTitle: "Contact Us",
    entityDesc:  `Visit ${BRAND.NAME} in ${BRAND.LOCATION}. Get directions, hours, and contact details.`,
  });
}

function ContactRow({
  icon: Icon, label, value, href, external,
}: {
  icon: ComponentType<{ className?: string }>; label: string; value: string; href?: string; external?: boolean;
}) {
  const externalAttrs = external ? { target: "_blank", rel: "noopener noreferrer" } : {};
  return (
    <div className="flex gap-4">
      <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-primary-50 text-primary-700">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">{label}</p>
        {href ? (
          <a href={href} {...externalAttrs} className="break-words font-medium text-primary-800 transition-colors hover:text-primary-600">
            {value}
          </a>
        ) : (
          <p className="break-words font-medium text-charcoal-800">{value}</p>
        )}
      </div>
    </div>
  );
}

function SocialRow({ social }: { social: ClinicPublicContent["social"] }) {
  const links = [
    { url: social.instagram, Icon: InstagramIcon, label: "Instagram" },
    { url: social.facebook, Icon: FacebookIcon, label: "Facebook" },
    { url: social.googleBusiness, Icon: GoogleIcon, label: "Google" },
  ].filter((l) => l.url);
  if (links.length === 0) return null;
  return (
    <div className="mt-6 flex gap-2.5 border-t border-border/60 pt-6">
      {links.map(({ url, Icon, label }) => (
        <a
          key={label}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-900 text-white transition-colors hover:bg-primary-700"
        >
          <Icon className="h-4 w-4" />
        </a>
      ))}
    </div>
  );
}

function HoursBlock({ workingHours }: { workingHours: ClinicPublicContent["workingHours"] }) {
  return (
    <div className="h-full rounded-3xl bg-primary-900 p-7 md:p-9">
      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-[hsl(var(--accent-cyan))]">
        Plan your visit
      </p>
      <h2 className="heading-3 mb-6 text-white">Working Hours</h2>
      <dl className="grid grid-cols-1 gap-x-10 gap-y-1 sm:grid-cols-2">
        {DAYS.map((day) => {
          const hours = workingHours[day];
          return (
            <div key={day} className="flex justify-between border-b border-white/10 py-2 text-sm">
              <dt className="text-white/60">{DAY_LABELS[day]}</dt>
              <dd className={hours.closed ? "text-white/50" : "font-medium text-white"}>
                {hours.closed ? "Closed" : `${hours.open} – ${hours.close}`}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}

export default async function ContactPage() {
  const cms = getCmsProvider();
  const clinic = await cms.getClinicConfig();
  const c = clinic.contact;
  const hasMap = Boolean(c.mapEmbedUrl);
  const whatsappHref = c.whatsapp
    ? (c.whatsapp.startsWith("http") ? c.whatsapp : `https://wa.me/${c.whatsapp.replace(/\D/g, "")}`)
    : "";

  return (
    <>
      {/* Petrol hero */}
      <section className="bg-primary-900 text-white">
        <div className="container-base py-20 md:py-28 lg:py-32">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-[hsl(var(--accent-cyan))]">
            Get In Touch
          </p>
          <h1 className="heading-1 max-w-3xl text-white">Contact Us</h1>
          <p className="body-lg mt-5 max-w-xl text-white/70">
            We look forward to welcoming you to our clinic in {BRAND.LOCATION}.
          </p>
        </div>
      </section>

      <Section bg="muted" size="lg">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Contact card */}
          <Reveal variant="fadeUp">
            <div className="rounded-3xl border border-border/60 bg-card p-7 shadow-sm md:p-9">
              <div className="space-y-5">
                {c.address && <ContactRow icon={MapPin} label="Address" value={c.address} />}
                {c.phone && <ContactRow icon={Phone} label="Phone" value={c.phone} href={`tel:${c.phone}`} />}
                {whatsappHref && (
                  <ContactRow icon={WhatsAppIcon} label="WhatsApp" value={c.whatsapp} href={whatsappHref} external />
                )}
                {c.email && <ContactRow icon={Mail} label="Email" value={c.email} href={`mailto:${c.email}`} />}
              </div>

              <SocialRow social={clinic.social} />

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href="/book"
                  className="btn-base inline-flex items-center justify-center bg-primary-900 px-6 py-3 text-white hover:bg-primary-800"
                >
                  Book Appointment
                </Link>
                {c.mapDirectionsUrl && (
                  <a
                    href={c.mapDirectionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-base inline-flex items-center justify-center border border-primary-700 px-6 py-3 text-primary-700 transition-colors hover:bg-primary-50"
                  >
                    Get Directions
                  </a>
                )}
                <GoogleReviewButton variant="outline" />
              </div>
            </div>
          </Reveal>

          {/* Right: map if present, else the hours block (keeps the layout balanced) */}
          <Reveal variant="fadeUp" delay={0.1}>
            {hasMap ? (
              <div className="h-[360px] overflow-hidden rounded-3xl border border-border/60 lg:h-full lg:min-h-[520px]">
                <iframe
                  src={c.mapEmbedUrl}
                  title="Clinic location map"
                  className="h-full w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            ) : (
              <HoursBlock workingHours={clinic.workingHours} />
            )}
          </Reveal>
        </div>

        {/* When a map is shown above, hours get their own full-width block below */}
        {hasMap && (
          <Reveal variant="fadeUp" className="mt-8">
            <HoursBlock workingHours={clinic.workingHours} />
          </Reveal>
        )}
      </Section>
    </>
  );
}
