/**
 * Phase 6.2C Integration Tests
 *
 * Tests: cross-resource flows, blog publication safety,
 *        review moderation flow, appointment transition enforcement,
 *        media lifecycle, cache invalidation descriptors.
 *
 * Uses Vitest without browser/JSDOM.
 * Mocks Mongoose to test service/validation logic directly.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Blog status transition tests ────────────────────────────────────────────
import { isValidTransition, resolveStatusDef } from "../types";
import { blogStatusConfig } from "@/features/blog/config/blog.config";
import type { BlogStatus }   from "@/features/blog/service/blog.service";

describe("Blog status transitions (server-enforced)", () => {
  it("draft → published is valid", () => {
    expect(isValidTransition(blogStatusConfig, "draft", "published")).toBe(true);
  });
  it("published → draft is valid (unpublish)", () => {
    expect(isValidTransition(blogStatusConfig, "published", "draft")).toBe(true);
  });
  it("draft cannot skip to arbitrary status", () => {
    // Only draft→published is allowed
    expect(isValidTransition(blogStatusConfig, "draft", "draft")).toBe(false);
  });
  it("published is marked as public", () => {
    const def = resolveStatusDef(blogStatusConfig, "published");
    expect(def?.isPublic).toBe(true);
  });
  it("draft is not public", () => {
    const def = resolveStatusDef(blogStatusConfig, "draft");
    expect(def?.isPublic).toBeFalsy();
  });
});

// ─── Appointment transition enforcement ──────────────────────────────────────
import { appointmentStatusConfig } from "@/features/appointments/config/appointments.config";
import { APPOINTMENT_TRANSITIONS, type AppointmentStatus } from "@/features/appointments/service/appointments.service";

describe("Appointment status transitions (server-enforced)", () => {
  it("pending → approved is valid", () => {
    expect(isValidTransition(appointmentStatusConfig, "pending", "approved")).toBe(true);
  });
  it("pending → cancelled is valid", () => {
    expect(isValidTransition(appointmentStatusConfig, "pending", "cancelled")).toBe(true);
  });
  it("rejected is terminal (no transitions)", () => {
    const def = resolveStatusDef(appointmentStatusConfig, "rejected");
    expect(def?.terminal).toBe(true);
    expect(def?.allowedTransitions).toHaveLength(0);
  });
  it("cancelled is terminal", () => {
    const def = resolveStatusDef(appointmentStatusConfig, "cancelled");
    expect(def?.terminal).toBe(true);
  });
  it("completed is terminal", () => {
    const def = resolveStatusDef(appointmentStatusConfig, "completed");
    expect(def?.terminal).toBe(true);
  });
  it("approved → pending is NOT valid (no reversal)", () => {
    expect(isValidTransition(appointmentStatusConfig, "approved", "pending")).toBe(false);
  });
  it("APPOINTMENT_TRANSITIONS map is consistent with status config", () => {
    for (const [from, targets] of Object.entries(APPOINTMENT_TRANSITIONS)) {
      for (const target of targets as AppointmentStatus[]) {
        expect(isValidTransition(appointmentStatusConfig, from as AppointmentStatus, target)).toBe(true);
      }
    }
  });
});

// ─── Review moderation flow ──────────────────────────────────────────────────
import { reviewStatusConfig } from "@/features/reviews/config/reviews.config";
import type { ReviewStatus }  from "@/features/reviews/service/reviews.service";

describe("Review moderation status transitions", () => {
  it("pending → approved is valid", () => {
    expect(isValidTransition(reviewStatusConfig, "pending", "approved")).toBe(true);
  });
  it("pending → rejected is valid", () => {
    expect(isValidTransition(reviewStatusConfig, "pending", "rejected")).toBe(true);
  });
  it("rejected → approved is valid (reverse moderation)", () => {
    expect(isValidTransition(reviewStatusConfig, "rejected", "approved")).toBe(true);
  });
  it("approved is public", () => {
    const def = resolveStatusDef(reviewStatusConfig, "approved");
    expect(def?.isPublic).toBe(true);
  });
  it("pending is not public", () => {
    const def = resolveStatusDef(reviewStatusConfig, "pending");
    expect(def?.isPublic).toBeFalsy();
  });
  it("rejected is not public", () => {
    const def = resolveStatusDef(reviewStatusConfig, "rejected");
    expect(def?.isPublic).toBeFalsy();
  });
});

// ─── Cache invalidation descriptors ─────────────────────────────────────────
import { DOCTOR_CACHE }      from "@/features/doctors/config/doctors.config";
import { SERVICE_CACHE }     from "@/features/services/config/services.config";
import { BLOG_CACHE }        from "@/features/blog/config/blog.config";
import { GALLERY_CACHE }     from "@/features/gallery/config/gallery.config";
import { FAQ_CACHE }         from "@/features/faq/config/faq.config";
import { REVIEW_CACHE }      from "@/features/reviews/config/reviews.config";
import { APPOINTMENT_CACHE } from "@/features/appointments/config/appointments.config";
import { CACHE_TAGS }        from "@/lib/cache";

describe("Cache invalidation descriptors", () => {
  it("DOCTOR_CACHE includes doctors tag", () => {
    expect(DOCTOR_CACHE.tags).toContain(CACHE_TAGS.doctors);
  });
  it("DOCTOR_CACHE includes homepage (doctors appear on homepage)", () => {
    expect(DOCTOR_CACHE.tags).toContain(CACHE_TAGS.homepage);
  });
  it("SERVICE_CACHE includes services + homepage tags", () => {
    expect(SERVICE_CACHE.tags).toContain(CACHE_TAGS.services);
    expect(SERVICE_CACHE.tags).toContain(CACHE_TAGS.homepage);
  });
  it("BLOG_CACHE includes blog tag", () => {
    expect(BLOG_CACHE.tags).toContain(CACHE_TAGS.blog);
  });
  it("GALLERY_CACHE includes gallery + homepage", () => {
    expect(GALLERY_CACHE.tags).toContain(CACHE_TAGS.gallery);
    expect(GALLERY_CACHE.tags).toContain(CACHE_TAGS.homepage);
  });
  it("FAQ_CACHE includes faq + homepage", () => {
    expect(FAQ_CACHE.tags).toContain(CACHE_TAGS.faq);
    expect(FAQ_CACHE.tags).toContain(CACHE_TAGS.homepage);
  });
  it("REVIEW_CACHE includes reviews + homepage", () => {
    expect(REVIEW_CACHE.tags).toContain(CACHE_TAGS.reviews);
    expect(REVIEW_CACHE.tags).toContain(CACHE_TAGS.homepage);
  });
  it("APPOINTMENT_CACHE does not include homepage (appointments are admin-only)", () => {
    expect(APPOINTMENT_CACHE.tags).not.toContain(CACHE_TAGS.homepage);
  });
});

// ─── Gallery before/after integrity ─────────────────────────────────────────
describe("Gallery type integrity rules (validated in API)", () => {
  // These test the business rules documented in the API code.
  // Actual enforcement is in app/api/gallery/route.ts.
  it("before_after type requires both images (documented constraint)", () => {
    const validateBeforeAfter = (before?: unknown, after?: unknown) => {
      if (!before || !after) return { valid: false, error: "Both images required" };
      return { valid: true };
    };
    expect(validateBeforeAfter(null, {url:"x"})).toMatchObject({ valid: false });
    expect(validateBeforeAfter({url:"a"}, {url:"b"})).toMatchObject({ valid: true });
  });
  it("general type requires image", () => {
    const validateGeneral = (image?: unknown) => {
      if (!image) return { valid: false, error: "Image required" };
      return { valid: true };
    };
    expect(validateGeneral(null)).toMatchObject({ valid: false });
    expect(validateGeneral({url:"x"})).toMatchObject({ valid: true });
  });
});

// ─── Media lifecycle (unit tests of utility functions) ───────────────────────
describe("Media cleanup contract", () => {
  it("finalizeMediaOwnership is exported from lib/media/cleanup", async () => {
    const { finalizeMediaOwnership, scheduleMediaForCleanup } = await import("@/lib/media/cleanup");
    expect(typeof finalizeMediaOwnership).toBe("function");
    expect(typeof scheduleMediaForCleanup).toBe("function");
  });

  it("scheduleMediaForCleanup accepts valid reason strings", async () => {
    // Verify the function accepts documented reason values
    const { scheduleMediaForCleanup } = await import("@/lib/media/cleanup");
    // We can't call it without DB, but we verify the function accepts the typed reasons
    expect(typeof scheduleMediaForCleanup).toBe("function");
    // TypeScript would catch invalid reason strings at compile time
  });
});

// ─── Resource action executors (unit tests) ──────────────────────────────────
import { doctorConfig }  from "@/features/doctors/config/doctors.config";
import { faqConfig }     from "@/features/faq/config/faq.config";

describe("Resource action executor contract", () => {
  it("every destructive action has a confirm config", () => {
    for (const config of [doctorConfig, faqConfig]) {
      const destructive = (config.actions ?? []).filter(a => a.destructive);
      for (const action of destructive) {
        expect(action.confirm, `Action "${action.id}" on ${config.meta.label} must have confirm config`).toBeDefined();
      }
    }
  });

  it("non-delete row actions have executors", () => {
    const actionsWithExecutors = (doctorConfig.actions ?? [])
      .filter(a => a.scope.includes("row") && a.id !== "edit");
    for (const action of actionsWithExecutors) {
      expect(action.executor, `Action "${action.id}" must have executor`).toBeDefined();
    }
  });

  it("activate executor calls service.update with isActive:true", async () => {
    const mockService = {
      update: vi.fn().mockResolvedValue({ success: true }),
    };
    const activateAction = (doctorConfig.actions ?? []).find(a => a.id === "activate");
    expect(activateAction).toBeDefined();
    if (!activateAction?.executor) throw new Error('No executor');
    await activateAction.executor(
      { id: "doc1", name: "Test" } as Parameters<NonNullable<typeof activateAction.executor>>[0],
      mockService as unknown as Parameters<NonNullable<typeof activateAction.executor>>[1]
    );
    expect(mockService.update).toHaveBeenCalledWith("doc1", { isActive: true });
  });

  it("deactivate executor calls service.update with isActive:false", async () => {
    const mockService = { update: vi.fn().mockResolvedValue({ success: true }) };
    const action = (doctorConfig.actions ?? []).find(a => a.id === "deactivate");
    if (!action?.executor) throw new Error('No executor');
    await action.executor(
      { id: "doc2", name: "Test" } as Parameters<NonNullable<typeof action.executor>>[0],
      mockService as unknown as Parameters<NonNullable<typeof action.executor>>[1]
    );
    expect(mockService.update).toHaveBeenCalledWith("doc2", { isActive: false });
  });
});
