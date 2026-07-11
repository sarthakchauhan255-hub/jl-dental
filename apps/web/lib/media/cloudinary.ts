/**
 * Cloudinary server-side utilities.
 * NEVER import this in client components — API keys are server-only.
 *
 * All uploads go through /api/media/upload route (admin-authenticated).
 * No unsigned upload presets — ever.
 */
import { v2 as cloudinary } from "cloudinary";
import { logger }           from "@/lib/logger";
import { CLOUDINARY_FOLDERS } from "@/constants";
import type { MediaAsset }  from "@/types";
import { env } from "@/env";
import { BRAND } from "@/config/branding";

// ─── Configuration ────────────────────────────────────────────────────────────
// Configured lazily to avoid errors during build when env vars absent
let configured = false;

function ensureConfigured(): void {
  if (configured) return;
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key:    env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure:     true,
  });
  configured = true;
}

// ─── Types ────────────────────────────────────────────────────────────────────
export type CloudinaryFolder = string; // accepts any folder path

export interface UploadResult {
  success:  boolean;
  asset?:   MediaAsset;
  error?:   string;
}

export interface DeleteResult {
  success: boolean;
  error?:  string;
}

// ─── Upload ───────────────────────────────────────────────────────────────────
/**
 * Upload a file buffer to Cloudinary.
 * Server-side only. Called from /api/media/upload after auth + validation.
 */
export async function uploadToCloudinary(
  buffer:     Buffer,
  folder:     CloudinaryFolder,
  options:    {
    publicId?:    string;
    transformation?: Record<string, unknown>;
    tags?:        string[];
  } = {}
): Promise<UploadResult> {
  ensureConfigured();

  return new Promise((resolve) => {
    const folderKey = folder.split("/")[0] as keyof typeof CLOUDINARY_FOLDERS;
    const folderPath = folderKey in CLOUDINARY_FOLDERS
      ? folder.replace(folderKey, CLOUDINARY_FOLDERS[folderKey])
      : `${BRAND.CLOUDINARY_PREFIX}/${folder}`;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder:      folderPath,
        public_id:   options.publicId,
        tags:        options.tags ?? [BRAND.CLOUDINARY_PREFIX],
        overwrite:   false,
        // Auto format and quality — delivery optimization
        format:      "auto",
        quality:     "auto:good",
        // Resource type
        resource_type: "image",
        transformation: options.transformation,
      },
      (error, result) => {
        if (error || !result) {
          logger.service("Cloudinary", "upload", "failure", { error: String(error) });
          resolve({ success: false, error: error?.message ?? "Upload failed" });
          return;
        }

        logger.service("Cloudinary", "upload", "success", {
          publicId: result.public_id,
          size:     result.bytes,
        });

        resolve({
          success: true,
          asset: {
            url:      result.secure_url,
            publicId: result.public_id,
            width:    result.width,
            height:   result.height,
          },
        });
      }
    );

    uploadStream.end(buffer);
  });
}

// ─── Delete ───────────────────────────────────────────────────────────────────
/**
 * Delete an asset from Cloudinary by publicId.
 * Called server-side on entity delete or image replace.
 */
export async function deleteFromCloudinary(publicId: string): Promise<DeleteResult> {
  ensureConfigured();

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });

    if (result.result === "ok" || result.result === "not found") {
      logger.service("Cloudinary", `delete:${publicId}`, "success");
      return { success: true };
    }

    logger.service("Cloudinary", `delete:${publicId}`, "failure", { result });
    return { success: false, error: `Delete returned: ${result.result}` };
  } catch (err) {
    const error = err instanceof Error ? err.message : "Unknown error";
    logger.service("Cloudinary", `delete:${publicId}`, "failure", { error });
    return { success: false, error };
  }
}

/**
 * Delete multiple assets. Used for blog post cleanup (inline images).
 * Failures are logged but don't block — orphan cron handles remnants.
 */
export async function deleteMany(publicIds: string[]): Promise<void> {
  ensureConfigured();

  const results = await Promise.allSettled(
    publicIds.map((id) => deleteFromCloudinary(id))
  );

  const failed = results.filter(
    (r) => r.status === "rejected" || (r.status === "fulfilled" && !r.value.success)
  );

  if (failed.length > 0) {
    logger.warn("[Cloudinary] Some deletes failed", {
      total:  publicIds.length,
      failed: failed.length,
    });
  }
}

// ─── File validation ──────────────────────────────────────────────────────────
const MAGIC_BYTES: Record<string, number[][]> = {
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/png":  [[0x89, 0x50, 0x4e, 0x47]],
  "image/webp": [[0x52, 0x49, 0x46, 0x46]],
};

/**
 * Validate file by inspecting magic bytes (not just extension or MIME type).
 * Prevents disguised file uploads.
 */
export function validateFileMagicBytes(
  buffer: Buffer,
  declaredType: string
): boolean {
  const signatures = MAGIC_BYTES[declaredType];
  if (!signatures) return false;

  return signatures.some((sig) =>
    sig.every((byte, i) => buffer[i] === byte)
  );
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export interface FileValidationResult {
  valid:  boolean;
  error?: string;
}

export function validateUploadFile(
  buffer: Buffer,
  mimeType: string,
  filename: string
): FileValidationResult {
  // Type check
  if (!ALLOWED_TYPES.includes(mimeType as (typeof ALLOWED_TYPES)[number])) {
    return { valid: false, error: "File type not allowed. Use JPG, PNG, or WebP." };
  }

  // Size check
  if (buffer.length > MAX_FILE_SIZE) {
    return { valid: false, error: "File exceeds 10MB limit." };
  }

  // Magic bytes check
  if (!validateFileMagicBytes(buffer, mimeType)) {
    return { valid: false, error: "File content does not match declared type." };
  }

  // Filename safety — log but don't block
  if (/[<>:"\/\\|?*]/.test(filename)) {
    logger.warn("[Upload] Suspicious filename", { filename });
  }

  return { valid: true };
}
