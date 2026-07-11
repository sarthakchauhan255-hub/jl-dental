import Link from "next/link";
import Image from "next/image";
import { getBrandAssets, BRAND } from "@/config/branding";
import { cn } from "@/lib/utils";

export interface CmsLogoAsset {
  url:  string;
  alt?: string;
}

interface BrandLogoProps {
  variant?:   "default" | "light" | "dark";
  href?:      string | null;
  className?: string;
  imgClassName?: string;
  /**
   * CMS-managed logo from Clinic Settings (via CmsProvider).
   * When present it is the production logo; the static brand asset is
   * ONLY the fallback for missing CMS content.
   */
  cmsLogo?: CmsLogoAsset | null;
}

/**
 * The only sanctioned way to render the clinic logo.
 * Priority: CMS logo (Clinic Settings → Cloudinary) → static fallback asset.
 * Fixed height (h-9) preserves navbar stability and prevents layout shift.
 */
export function BrandLogo({
  variant = "default",
  href = "/",
  className,
  imgClassName,
  cmsLogo,
}: BrandLogoProps) {
  const brand = getBrandAssets();
  const src   = cmsLogo?.url ?? brand.logo[variant];
  const alt   = cmsLogo?.alt ?? BRAND.LOGO_ALT;

  const mark = (
    <Image
      src={src}
      alt={alt}
      width={160}
      height={40}
      priority
      className={cn("h-9 w-auto", imgClassName)}
    />
  );

  if (!href) return <span className={className}>{mark}</span>;

  return (
    <Link href={href} className={cn("inline-flex items-center", className)} aria-label={brand.name}>
      {mark}
    </Link>
  );
}
