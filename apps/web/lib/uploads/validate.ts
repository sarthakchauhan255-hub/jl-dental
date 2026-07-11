import type { UploadPolicy } from "./policies";

export interface UploadValidationResult {
  valid:    boolean;
  error?:   string;
  warning?: string;
}

/** File magic byte signatures for server-side type verification. */
const MAGIC_BYTES: Record<string, number[]> = {
  "image/jpeg": [0xff, 0xd8, 0xff],
  "image/png":  [0x89, 0x50, 0x4e, 0x47],
  "image/webp": [0x52, 0x49, 0x46, 0x46],
};

function checkMagicBytes(buffer: Buffer, mimeType: string): boolean {
  const sig = MAGIC_BYTES[mimeType];
  if (!sig) return false;
  return sig.every((byte, i) => buffer[i] === byte);
}

/**
 * Full server-side validation of an uploaded file against its policy.
 * Called in /api/uploads route before any Cloudinary interaction.
 */
export function validateUpload(
  buffer:   Buffer,
  mimeType: string,
  policy:   UploadPolicy
): UploadValidationResult {
  if (!policy.allowedMimeTypes.includes(mimeType)) {
    return { valid: false, error: `File type not allowed. Accepted: ${policy.allowedMimeTypes.map((t) => t.split("/")[1].toUpperCase()).join(", ")}.` };
  }
  if (buffer.length > policy.maxSizeBytes) {
    const mb = (policy.maxSizeBytes / 1024 / 1024).toFixed(0);
    return { valid: false, error: `File exceeds ${mb}MB limit.` };
  }
  if (!checkMagicBytes(buffer, mimeType)) {
    return { valid: false, error: "File content does not match the declared type." };
  }
  if (buffer.length < 1024) {
    return { valid: true, warning: "File is unusually small. It may appear low quality." };
  }
  return { valid: true };
}
