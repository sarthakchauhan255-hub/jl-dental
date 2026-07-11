/**
 * Upload policies — centralized constraints for all media uploads.
 * Every upload context (doctors, blog, gallery, clinic) has explicit rules.
 * No ad-hoc validation scattered across route handlers.
 */

export type UploadFolder =
  | "clinic"
  | "doctors"
  | "services"
  | "blog"
  | "gallery/before-after"
  | "gallery/general";

export interface UploadPolicy {
  folder:           UploadFolder;
  allowedMimeTypes: string[];
  maxSizeBytes:     number;
  maxWidth?:        number;
  maxHeight?:       number;
  /** Aspect ratio enforcement: "16:9", "3:4", etc. Null = any */
  aspectRatio?:     string | null;
  /** Cloudinary transformation preset applied at upload */
  transformation?:  Record<string, unknown>;
}

const MB = 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export const UPLOAD_POLICIES: Record<UploadFolder, UploadPolicy> = {
  clinic: {
    folder:           "clinic",
    allowedMimeTypes: [...ALLOWED_IMAGE_TYPES],
    maxSizeBytes:     5 * MB,
    maxWidth:         2400,
  },
  doctors: {
    folder:           "doctors",
    allowedMimeTypes: [...ALLOWED_IMAGE_TYPES],
    maxSizeBytes:     5 * MB,
    maxWidth:         800,
    maxHeight:        1067,   // 3:4 portrait
    aspectRatio:      "3:4",
    transformation:   { crop: "fill", gravity: "face", width: 800, height: 1067 },
  },
  services: {
    folder:           "services",
    allowedMimeTypes: [...ALLOWED_IMAGE_TYPES],
    maxSizeBytes:     8 * MB,
    maxWidth:         1600,
    aspectRatio:      "16:9",
    transformation:   { crop: "fill", width: 1600, height: 900 },
  },
  blog: {
    folder:           "blog",
    allowedMimeTypes: [...ALLOWED_IMAGE_TYPES],
    maxSizeBytes:     8 * MB,
    maxWidth:         1600,
    aspectRatio:      "16:9",
    transformation:   { crop: "fill", width: 1600, height: 900 },
  },
  "gallery/before-after": {
    folder:           "gallery/before-after",
    allowedMimeTypes: [...ALLOWED_IMAGE_TYPES],
    maxSizeBytes:     10 * MB,
    maxWidth:         2000,
    aspectRatio:      "4:3",
    transformation:   { crop: "fill", width: 1200, height: 900 },
  },
  "gallery/general": {
    folder:           "gallery/general",
    allowedMimeTypes: [...ALLOWED_IMAGE_TYPES],
    maxSizeBytes:     10 * MB,
    maxWidth:         2000,
  },
};

export function getPolicyForFolder(folder: UploadFolder): UploadPolicy {
  return UPLOAD_POLICIES[folder];
}
