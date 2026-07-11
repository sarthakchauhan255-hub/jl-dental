import type { Metadata } from "next";
import { BookingForm }      from "@/features/appointment/components/booking-form";
import { getCmsProvider }     from "@/features/shared/cms";
import { resolveMetadata }  from "@/lib/seo";
import { BRAND } from "@/config/branding";

export async function generateMetadata(): Promise<Metadata> {
  return resolveMetadata({
    path: "/book",
    entityTitle: "Book an Appointment",
    entityDesc:  `Schedule your dental consultation at ${BRAND.NAME}, ${BRAND.CITY}.`,
    pageSeo: { noIndex: true },
  });
}

export default async function BookPage() {
  const cms = getCmsProvider();
  const services = await cms.getServices();

  return (
    <section className="py-16 md:py-24">
      <div className="container-narrow">
        <div className="text-center mb-10">
          <span className="label-luxury">Schedule Your Visit</span>
          <h1 className="heading-2 mt-3 mb-3 balance">Book an Appointment</h1>
          <p className="body-base text-muted-foreground max-w-md mx-auto">
            Fill out the form below and we&apos;ll confirm your appointment within a few hours.
          </p>
        </div>

        <div className="card-base p-6 md:p-10">
          <BookingForm services={services} />
        </div>
      </div>
    </section>
  );
}
