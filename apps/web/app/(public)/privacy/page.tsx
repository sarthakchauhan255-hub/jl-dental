import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/common/section";
import { getCmsProvider } from "@/features/shared/cms";
import { resolveMetadata } from "@/lib/seo";
import { REVALIDATE } from "@/lib/cache";
import { BRAND } from "@/config/branding";

export const revalidate = REVALIDATE.contact;

export async function generateMetadata(): Promise<Metadata> {
  return resolveMetadata({
    path: "/privacy",
    entityTitle: "Privacy Policy",
    entityDesc:  `How ${BRAND.NAME} collects, uses, and protects your personal information.`,
  });
}

function Clause({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="heading-4 mb-3 text-primary-900">{title}</h2>
      <div className="space-y-3 leading-relaxed text-charcoal-700">{children}</div>
    </section>
  );
}

export default async function PrivacyPage() {
  const clinic = await getCmsProvider().getClinicConfig();
  const email = clinic.contact.email;

  return (
    <>
      <section className="bg-primary-900 text-white">
        <div className="container-base py-20 md:py-28 lg:py-32">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-[hsl(var(--accent-cyan))]">
            Your Privacy
          </p>
          <h1 className="heading-1 max-w-3xl text-white">Privacy Policy</h1>
          <p className="body-lg mt-5 max-w-xl text-white/70">Last updated: August 2026</p>
        </div>
      </section>

      <Section bg="muted" size="lg">
        <div className="container-narrow">
          <Clause title="Introduction">
            <p>
              This Privacy Policy explains how {BRAND.NAME} collects, uses, and protects the personal
              information you provide when you use our website or request an appointment. By using this
              website, you agree to the practices described in this policy.
            </p>
          </Clause>

          <Clause title="Information We Collect">
            <p>
              When you request an appointment, we collect the details you enter into our booking form:
              your name, phone number, email address, preferred date and time, the service you are
              interested in, and any additional notes you choose to provide.
            </p>
            <p>
              We may also collect basic, non-identifying information about how visitors use our website,
              such as the pages viewed, to help us understand and improve the site.
            </p>
          </Clause>

          <Clause title="How We Use Your Information">
            <p>
              We use the information you provide to review, confirm, and manage your appointment request,
              to contact you regarding your appointment, to respond to your enquiries, and to improve our
              website and the care we provide.
            </p>
          </Clause>

          <Clause title="How We Store and Protect Your Information">
            <p>
              Your information is stored using reputable third-party services that host our website,
              database, and email. We take reasonable measures to keep your information secure. However,
              no method of transmission over the internet or electronic storage is completely secure, and
              we cannot guarantee absolute security.
            </p>
          </Clause>

          <Clause title="Sharing Your Information">
            <p>
              We do not sell or rent your personal information. We share it only with the service providers
              that help us operate this website, such as our hosting and email providers, and where we are
              required to do so by law.
            </p>
          </Clause>

          <Clause title="Cookies and Analytics">
            <p>
              Our website may use basic analytics to understand how visitors use the site. Where used, this
              information is aggregated and is not used to identify you personally.
            </p>
          </Clause>

          <Clause title="Data Retention">
            <p>
              We keep your information only for as long as necessary to handle your appointment and to meet
              our record-keeping and legal obligations, after which it is deleted or anonymised.
            </p>
          </Clause>

          <Clause title="Your Rights">
            <p>
              You may request access to, correction of, or deletion of the personal information we hold
              about you. To make such a request, please contact us using the details below, and we will
              respond in accordance with applicable law.
            </p>
          </Clause>

          <Clause title="Children">
            <p>
              This website is intended for use by adults. If you are under 18, please use it only with the
              involvement of a parent or guardian.
            </p>
          </Clause>

          <Clause title="Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. The most current version will always be
              available on this page, with the date it was last updated shown above.
            </p>
          </Clause>

          <Clause title="Contact Us">
            <p>
              If you have any questions about this Privacy Policy or the personal information we hold, please
              contact {BRAND.NAME}, {BRAND.LOCATION}
              {email ? <> at <a href={`mailto:${email}`} className="text-primary-700 underline">{email}</a></> : <>{" "}via our <Link href="/contact" className="text-primary-700 underline">Contact page</Link></>}.
            </p>
          </Clause>
        </div>
      </Section>
    </>
  );
}
