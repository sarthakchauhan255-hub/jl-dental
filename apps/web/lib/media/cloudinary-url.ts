/**
 * Centralized Cloudinary URL construction.
 * ALL image URL generation goes through this file — no scattered string building.
 * Never import this in server components that also use cloudinary SDK.
 */
import { env } from "@/env";


const CLOUD_NAME = env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const BASE_URL   = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`;

export interface CloudinaryTransform {
  width?:   number;
  height?:  number;
  crop?:    "fill" | "fit" | "limit" | "scale" | "thumb" | "crop";
  gravity?: "face" | "center" | "auto" | "north" | "south";
  quality?: "auto" | "auto:good" | "auto:best" | "auto:eco" | number;
  format?:  "auto" | "webp" | "avif" | "jpg" | "png";
  radius?:  number | "max";
  aspectRatio?: string;
}

/**
 * Build a Cloudinary delivery URL with transformations.
 * Always adds f_auto and q_auto unless explicitly overridden.
 */
export function buildCloudinaryUrl(
  publicId: string,
  transform: CloudinaryTransform = {}
): string {
  if (!publicId || !CLOUD_NAME) return "";

  const {
    width,
    height,
    crop    = "fill",
    gravity,
    quality = "auto:good",
    format  = "auto",
    radius,
    aspectRatio,
  } = transform;

  const parts: string[] = [];

  if (width)       parts.push(`w_${width}`);
  if (height)      parts.push(`h_${height}`);
  if (width || height) parts.push(`c_${crop}`);
  if (gravity)     parts.push(`g_${gravity}`);
  if (aspectRatio) parts.push(`ar_${aspectRatio}`);
  if (radius)      parts.push(`r_${radius}`);
  parts.push(`q_${quality}`);
  parts.push(`f_${format}`);
  parts.push("dpr_auto");

  const transformation = parts.join(",");
  return `${BASE_URL}/${transformation}/${publicId}`;
}

// ─── Preset builders for common contexts ────────────────────────────────────

/** Doctor profile photo — 3:4 portrait, face-aware crop */
export function doctorPhotoUrl(publicId: string, width = 400): string {
  return buildCloudinaryUrl(publicId, {
    width,
    height: Math.round(width * (4 / 3)),
    crop:    "fill",
    gravity: "face",
  });
}

/** Service cover image — 16:9 */
export function serviceCoverUrl(publicId: string, width = 800): string {
  return buildCloudinaryUrl(publicId, {
    width,
    height: Math.round(width * (9 / 16)),
    crop:   "fill",
  });
}

/** Blog cover image — 16:9 */
export function blogCoverUrl(publicId: string, width = 1200): string {
  return buildCloudinaryUrl(publicId, {
    width,
    height: Math.round(width * (9 / 16)),
    crop:   "fill",
  });
}

/** Gallery image — 4:3 */
export function galleryImageUrl(publicId: string, width = 800): string {
  return buildCloudinaryUrl(publicId, {
    width,
    height: Math.round(width * (3 / 4)),
    crop:   "fill",
  });
}

/** OG image — 1200×630 */
export function ogImageUrl(publicId: string): string {
  return buildCloudinaryUrl(publicId, {
    width:  1200,
    height: 630,
    crop:   "fill",
    format: "jpg",  // JPG has best OG compatibility
  });
}

/** Thumbnail — square */
export function thumbnailUrl(publicId: string, size = 80): string {
  return buildCloudinaryUrl(publicId, {
    width:   size,
    height:  size,
    crop:    "thumb",
    gravity: "face",
  });
}

/** Logo — preserve aspect ratio, limit max width */
export function logoUrl(publicId: string, maxWidth = 200): string {
  return buildCloudinaryUrl(publicId, {
    width: maxWidth,
    crop:  "limit",
  });
}
