import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Section, SectionHeader } from "@/components/common/section";
import { Reveal }         from "@/components/common/motion";
import { getCmsProvider } from "@/features/shared/cms";
import { resolveMetadata } from "@/lib/seo";
import { REVALIDATE }     from "@/lib/cache";
import { BRAND } from "@/config/branding";
import { GoogleReviewButton } from "@/components/common/google-review-button";

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

export default async function ContactPage() {
  const cms = getCmsProvider();
  const clinic = await cms.getClinicConfig();
  const hasMap = Boolean(clinic.contact.mapEmbedUrl);

  return (
    <Section bg="white" size="lg">
      <SectionHeader label="Get In Touch" heading="Contact Us" subtext="We'd love to see you at our Solan clinic." align="left" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {hasMap && (
          <Reveal variant="fadeUp" className="rounded-2xl overflow-hidden border border-charcoal-100 aspect-video lg:aspect-auto lg:h-[480px] order-2 lg:order-1">
            <iframe
              src={clinic.contact.mapEmbedUrl}
              title="Clinic location map"
              className="h-full w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </Reveal>
        )}

        <Reveal variant="fadeUp" delay={0.1} className={`order-1 lg:order-2 ${hasMap ? "" : "lg:col-span-2"}`}>
          <div className="space-y-6 mb-8">
            {clinic.contact.address && (
              <div className="flex gap-3">
                <MapPin className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-medium text-charcoal-900">Address</p>
                  <p className="body-sm text-muted-foreground">{clinic.contact.address}</p>
                </div>
              </div>
            )}
            {clinic.contact.phone && (
              <div className="flex gap-3">
                <Phone className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-medium text-charcoal-900">Phone</p>
                  <a href={`tel:${clinic.contact.phone}`} className="body-sm text-primary-700 hover:underline">{clinic.contact.phone}</a>
                </div>
              </div>
            )}
            {clinic.contact.email && (
              <div className="flex gap-3">
                <Mail className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-medium text-charcoal-900">Email</p>
                  <a href={`mailto:${clinic.contact.email}`} className="body-sm text-primary-700 hover:underline">{clinic.contact.email}</a>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 mb-8">
            <Clock className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div className="flex-1">
              <p className="font-medium text-charcoal-900 mb-2">Working Hours</p>
              <dl className="space-y-1">
                {DAYS.map((day) => {
                  const hours = clinic.workingHours[day];
                  return (
                    <div key={day} className="flex justify-between text-sm">
                      <dt className="text-muted-foreground">{DAY_LABELS[day]}</dt>
                      <dd className="text-charcoal-700">{hours.closed ? "Closed" : `${hours.open} – ${hours.close}`}</dd>
                    </div>
                  );
                })}
              </dl>
            </div>
          </div>

          {clinic.contact.mapDirectionsUrl && (
            <a
              href={clinic.contact.mapDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg border border-primary-700 px-6 py-3 text-sm font-medium text-primary-700 hover:bg-primary-50 transition-colors"
            >
              Get Directions
            </a>
          )}
          <GoogleReviewButton className="mt-3 w-full sm:w-auto" />

        </Reveal>
      </div>
    </Section>
  );
}
