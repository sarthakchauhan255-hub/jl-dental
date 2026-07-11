import { NextRequest, NextResponse }             from "next/server";
import { requireSession }                         from "@/lib/auth/session";
import { canUploadMedia }                         from "@/lib/auth/permissions";
import { AuthorizationError }                     from "@/lib/security/errors";
import { SessionExpiredError }                    from "@/lib/auth/errors";
import { getPolicyForFolder, type UploadFolder }  from "@/lib/uploads/policies";
import { validateUpload }                         from "@/lib/uploads/validate";
import { uploadToCloudinary }                     from "@/lib/media/cloudinary";
import { handleRouteError }                       from "@/lib/api/errors";
import { ok, err as apiErr }                      from "@/lib/api/responses";
import { MediaPendingCleanup }                    from "@/models/MediaPendingCleanup";
import { connectDB }                              from "@/lib/db/connection";
import { BRAND } from "@/config/branding";

const VALID_FOLDERS: UploadFolder[] = [
  "clinic", "doctors", "services", "blog", "gallery/before-after", "gallery/general",
];

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    let session: Awaited<ReturnType<typeof requireSession>>;
    try { session = await requireSession(); }
    catch { return apiErr(new SessionExpiredError().message, 401); }

    if (!canUploadMedia(session)) throw new AuthorizationError();

    const formData = await req.formData();
    const file     = formData.get("file");
    const folder   = (formData.get("folder") as string) ?? "clinic";

    if (!(file instanceof File)) {
      return apiErr("No file provided.", 400);
    }
    if (!VALID_FOLDERS.includes(folder as UploadFolder)) {
      return apiErr("Invalid upload folder.", 400);
    }

    const buffer   = Buffer.from(await file.arrayBuffer());
    const policy   = getPolicyForFolder(folder as UploadFolder);
    const check    = validateUpload(buffer, file.type, policy);

    if (!check.valid) return apiErr(check.error!, 422);

    const result = await uploadToCloudinary(buffer, folder as UploadFolder, {
      transformation: policy.transformation,
      tags: [BRAND.CLOUDINARY_PREFIX, folder],
    });

    if (!result.success || !result.asset) {
      return apiErr("Upload failed. Please try again.", 502);
    }

    // Track asset for orphan cleanup
    await connectDB();
    await MediaPendingCleanup.create({
      publicId:   result.asset.publicId,
      folder,
      uploadedBy: session.userId,
      reason:     "abandoned_upload",
    });

    return ok({ ...result.asset, warning: check.warning });
  } catch (err) {
    return handleRouteError(err);
  }
}
