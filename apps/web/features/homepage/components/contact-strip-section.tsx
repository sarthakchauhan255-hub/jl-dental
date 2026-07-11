import { MapPin, Phone, Clock } from "lucide-react";
import { Section } from "@/components/common/section";
import type { ClinicPublicContent } from "@/features/clinic/schemas/clinic-public.schema";

export function ContactStripSection({ clinic }: { clinic: ClinicPublicContent }) {
  const hasMap = Boolean(clinic.contact.mapEmbedUrl);

  return (
    <Section bg="white">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {hasMap && (
          <div className="rounded-2xl overflow-hidden border border-charcoal-100 aspect-video lg:aspect-auto lg:h-96">
            <iframe
              src={clinic.contact.mapEmbedUrl}
              title="Clinic location map"
              className="h-full w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        )}

        <div className={hasMap ? "" : "lg:col-span-2"}>
          <span className="label-luxury">Visit Us</span>
          <h2 className="heading-2 mt-3 mb-6 balance">Find Us in Solan</h2>

          <div className="space-y-5">
            {clinic.contact.address && (
              <div className="flex gap-3">
                <MapPin className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <p className="body-base text-charcoal-700">{clinic.contact.address}</p>
              </div>
            )}
            {clinic.contact.phone && (
              <div className="flex gap-3">
                <Phone className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <a href={`tel:${clinic.contact.phone}`} className="body-base text-charcoal-700 hover:text-primary-700">
                  {clinic.contact.phone}
                </a>
              </div>
            )}
            <div className="flex gap-3">
              <Clock className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <p className="body-base text-charcoal-700">
                Mon–Fri: {clinic.workingHours.monday.open} – {clinic.workingHours.monday.close}
              </p>
            </div>
          </div>

          {clinic.contact.mapDirectionsUrl && (
            <a
              href={clinic.contact.mapDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex items-center justify-center rounded-lg border border-primary-700 px-6 py-3 text-sm font-medium text-primary-700 hover:bg-primary-50 transition-colors"
            >
              Get Directions
            </a>
          )}
        </div>
      </div>
    </Section>
  );
}
