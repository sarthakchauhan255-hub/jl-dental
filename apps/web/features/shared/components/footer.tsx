import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";
import { InstagramIcon, FacebookIcon } from "@/components/icons/social";
import { BrandLogo }     from "@/components/common/brand-logo";
import { getCmsProvider } from "@/features/shared/cms";

export async function Footer() {
  const cms      = getCmsProvider();
  const [clinic, services] = await Promise.all([
    cms.getClinicConfig(),
    cms.getServices({ limit: 5 }),
  ]);
  const topServices = services.slice(0, 5);

  return (
    <footer className="bg-charcoal-900 text-charcoal-300">
      <div className="container-base py-16 md:py-20">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <BrandLogo variant="light" />
            <p className="mt-4 text-sm leading-relaxed text-charcoal-400 max-w-xs">
              Premium dental care in Solan, Himachal Pradesh — delivered with
              compassion and precision.
            </p>
            <div className="mt-5 flex items-center gap-3">
              {clinic.social.instagram && (
                <a href={clinic.social.instagram} target="_blank" rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                  <InstagramIcon className="h-4 w-4" />
                </a>
              )}
              {clinic.social.facebook && (
                <a href={clinic.social.facebook} target="_blank" rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                  <FacebookIcon className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">Quick Links</h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: "Home", href: "/" },
                { label: "Doctors", href: "/doctors" },
                { label: "Gallery", href: "/gallery" },
                { label: "Blog", href: "/blog" },
                { label: "FAQ", href: "/faq" },
                { label: "Privacy Policy", href: "/privacy" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">Services</h3>
            {topServices.length > 0 ? (
              <ul className="space-y-2.5 text-sm">
                {topServices.map((s) => (
                  <li key={s.id}>
                    <Link href={`/services/${s.slug}`} className="hover:text-white transition-colors">{s.name}</Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-charcoal-500">Coming soon</p>
            )}
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              {clinic.contact.address && (
                <li className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary-400" aria-hidden="true" />
                  <span>{clinic.contact.address}</span>
                </li>
              )}
              {clinic.contact.phone && (
                <li className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 flex-shrink-0 text-primary-400" aria-hidden="true" />
                  <a href={`tel:${clinic.contact.phone}`} className="hover:text-white transition-colors">{clinic.contact.phone}</a>
                </li>
              )}
              {clinic.contact.email && (
                <li className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 flex-shrink-0 text-primary-400" aria-hidden="true" />
                  <a href={`mailto:${clinic.contact.email}`} className="hover:text-white transition-colors">{clinic.contact.email}</a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-charcoal-500">
          <p>&copy; {new Date().getFullYear()} {clinic.name}. All rights reserved.</p>
          <p>Solan, Himachal Pradesh, India</p>
        </div>
      </div>
    </footer>
  );
}
