/**
 * Media reference-protection decision logic (Case E) — unit tests.
 *
 * The REAL isMediaReferenced / scheduleMediaForCleanup code runs; only the
 * mongoose.models registry is populated with controlled fakes so that
 * model.exists() returns deterministic results. The full DB-backed flows
 * (FLOWS 10–15) live in lib/cms/__tests__/flows.integration.test.ts.
 */
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import mongoose from "mongoose";

// MediaPendingCleanup persistence is exercised by the DB flow tests;
// here we stub its module so scheduleMediaForCleanup can complete.
const upsertSpy = vi.fn().mockResolvedValue({});
const deleteSpy = vi.fn().mockResolvedValue({ deletedCount: 1 });
vi.mock("@/models/MediaPendingCleanup", () => ({
  MediaPendingCleanup: {
    findOneAndUpdate: (...args: unknown[]) => upsertSpy(...args),
    deleteOne:        (...args: unknown[]) => deleteSpy(...args),
    create:           vi.fn(),
  },
}));

type ExistsFn = (query: Record<string, unknown>) => Promise<unknown>;

function installModel(name: string, exists: ExistsFn) {
  (mongoose.models as Record<string, unknown>)[name] = { exists };
}

function clearModels() {
  for (const name of ["Doctor", "Service", "BlogPost", "Gallery", "Clinic"]) {
    delete (mongoose.models as Record<string, unknown>)[name];
  }
}

beforeEach(() => {
  clearModels();
  upsertSpy.mockClear();
  deleteSpy.mockClear();
});
afterEach(clearModels);

describe("isMediaReferenced (Case E core)", () => {
  it("returns true when any model references the publicId", async () => {
    installModel("Doctor",  async () => null);
    installModel("Service", async q => {
      const or = q.$or as Array<Record<string, unknown>>;
      return or.some(cond => cond["coverImage.publicId"] === "shared-1") ? { _id: "x" } : null;
    });
    const { isMediaReferenced } = await import("../cleanup");
    expect(await isMediaReferenced("shared-1")).toBe(true);
  });

  it("returns false when no model references the publicId", async () => {
    installModel("Doctor",  async () => null);
    installModel("Service", async () => null);
    installModel("Gallery", async () => null);
    const { isMediaReferenced } = await import("../cleanup");
    expect(await isMediaReferenced("orphan-1")).toBe(false);
  });

  it("excludes the mutating resource's own reference via _id $ne", async () => {
    let sawExclusion = false;
    installModel("Doctor", async q => {
      const ne = (q._id as { $ne?: string } | undefined)?.$ne;
      if (ne === "doc-1") { sawExclusion = true; return null; } // only doc-1 held it
      return { _id: "doc-1" };
    });
    const { isMediaReferenced } = await import("../cleanup");
    const referenced = await isMediaReferenced("photo-1", { resource: "doctor", resourceId: "doc-1" });
    expect(sawExclusion).toBe(true);
    expect(referenced).toBe(false);
  });

  it("skips models not registered (partial runtime) without throwing", async () => {
    installModel("Gallery", async () => null); // others absent
    const { isMediaReferenced } = await import("../cleanup");
    await expect(isMediaReferenced("x")).resolves.toBe(false);
  });
});

describe("scheduleMediaForCleanup (Cases C/D with E protection)", () => {
  it("schedules cleanup when the asset is unreferenced", async () => {
    installModel("Doctor", async () => null);
    const { scheduleMediaForCleanup } = await import("../cleanup");
    const result = await scheduleMediaForCleanup("free-asset", "image_replaced", "doctor", "d1");
    expect(result.scheduled).toBe(true);
    expect(upsertSpy).toHaveBeenCalledTimes(1);
  });

  it("REFUSES to schedule when another resource references the asset", async () => {
    installModel("Clinic", async () => ({ _id: "clinic-1" })); // still referenced
    const { scheduleMediaForCleanup } = await import("../cleanup");
    const result = await scheduleMediaForCleanup("shared-logo", "entity_deleted", "doctor", "d1");
    expect(result.scheduled).toBe(false);
    expect(result.reason).toBe("still_referenced");
    expect(upsertSpy).not.toHaveBeenCalled(); // NO destructive record created
  });

  it("never throws — persistence failure returns { scheduled: false }", async () => {
    installModel("Doctor", async () => null);
    upsertSpy.mockRejectedValueOnce(new Error("db down"));
    const { scheduleMediaForCleanup } = await import("../cleanup");
    const result = await scheduleMediaForCleanup("x", "image_replaced");
    expect(result.scheduled).toBe(false);
  });
});

describe("finalizeMediaOwnership (Case A)", () => {
  it("removes only the abandoned_upload marker", async () => {
    const { finalizeMediaOwnership } = await import("../cleanup");
    await finalizeMediaOwnership("new-asset", "doctor", "d1");
    expect(deleteSpy).toHaveBeenCalledWith({ publicId: "new-asset", reason: "abandoned_upload" });
  });

  it("never throws on persistence failure (non-blocking)", async () => {
    deleteSpy.mockRejectedValueOnce(new Error("db down"));
    const { finalizeMediaOwnership } = await import("../cleanup");
    await expect(finalizeMediaOwnership("x", "doctor", "d1")).resolves.toBeUndefined();
  });
});
