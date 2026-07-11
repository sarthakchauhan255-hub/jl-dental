import { Navbar }          from "@/features/shared/components/navbar";
import { Footer }          from "@/features/shared/components/footer";
import dynamic from "next/dynamic";
const WhatsAppButton = dynamic(
  () => import("@/features/shared/components/whatsapp-button").then(m => ({ default: m.WhatsAppButton })),
  { ssr: false }
);
import { getCmsProvider }  from "@/features/shared/cms";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const cms    = getCmsProvider();
  const clinic = await cms.getClinicConfig();

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-toast
                   focus:rounded-lg focus:bg-primary-700 focus:px-4 focus:py-2 focus:text-white focus:text-sm"
      >
        Skip to main content
      </a>
      <Navbar cmsLogo={clinic.logo ?? null} />
      <main id="main-content" className="pt-16 lg:pt-20">
        {children}
      </main>
      <Footer />
      <WhatsAppButton phone={clinic.contact.whatsapp || clinic.contact.phone} />
    </>
  );
}
