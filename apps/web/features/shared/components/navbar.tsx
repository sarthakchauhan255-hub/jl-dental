import Link from "next/link";
import { BrandLogo }            from "@/components/common/brand-logo";
import { NavbarScrollWrapper }  from "./navbar-scroll-wrapper";
import { NavbarMobileMenu }     from "./navbar-mobile-menu";
import { ServicesDropdown }     from "./services-dropdown";
import { getCmsProvider }       from "@/features/shared/cms";

const NAV_LINKS = [
  { label: "Home",     href: "/" },
  { label: "Doctors",  href: "/doctors" },
  { label: "Gallery",  href: "/gallery" },
  { label: "Blog",     href: "/blog" },
  { label: "FAQ",      href: "/faq" },
  { label: "Contact",  href: "/contact" },
];

/**
 * Server Component shell. Fetches services for the dropdown, then composes
 * client islands (scroll wrapper, mobile menu, services dropdown) around
 * server-rendered static content (links, logo, CTA).
 */
interface NavbarProps {
  cmsLogo?: { url: string; alt?: string } | null;
}

export async function Navbar({ cmsLogo }: NavbarProps = {}) {
  const cms      = getCmsProvider();
  const services = await cms.getServices();
  const serviceLinks = services.map((s) => ({ name: s.name, slug: s.slug }));

  const allLinksForMobile = [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: "Doctors", href: "/doctors" },
    { label: "Gallery", href: "/gallery" },
    { label: "Blog", href: "/blog" },
    { label: "FAQ", href: "/faq" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <NavbarScrollWrapper>
      <div className="container-base flex h-16 lg:h-20 items-center justify-between">
        <BrandLogo cmsLogo={cmsLogo} />

        <nav aria-label="Primary navigation" className="hidden lg:flex items-center gap-8">
          <Link href="/" className="text-sm font-medium text-charcoal-700 hover:text-primary-700 transition-colors">
            Home
          </Link>
          <ServicesDropdown services={serviceLinks} />
          {NAV_LINKS.slice(1).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-charcoal-700 hover:text-primary-700 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/book"
            className="hidden sm:inline-flex items-center justify-center rounded-lg bg-primary-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-800 transition-colors"
          >
            Book Appointment
          </Link>
          <NavbarMobileMenu links={allLinksForMobile} ctaHref="/book" ctaLabel="Book Appointment" />
        </div>
      </div>
    </NavbarScrollWrapper>
  );
}
