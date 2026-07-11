/**
 * CMS Status System Tests
 *
 * Tests: status definitions, transition validation, resolveStatusDef
 * Does NOT test business status values — those are resource concerns.
 */
import { resolveStatusDef, isValidTransition, type CmsStatusConfig } from "../types";

type BlogStatus = "draft" | "published" | "archived";

const blogStatusConfig: CmsStatusConfig<BlogStatus> = {
  field:         "status",
  defaultStatus: "draft",
  definitions: [
    { value: "draft",     label: "Draft",     badgeVariant: "warning", allowedTransitions: ["published","archived"] },
    { value: "published", label: "Published", badgeVariant: "success", allowedTransitions: ["draft","archived"], isPublic: true },
    { value: "archived",  label: "Archived",  badgeVariant: "neutral", allowedTransitions: ["draft"] },
  ],
};

describe("resolveStatusDef", () => {
  it("returns definition for known status", () => {
    const def = resolveStatusDef(blogStatusConfig, "draft");
    expect(def?.label).toBe("Draft");
    expect(def?.badgeVariant).toBe("warning");
  });

  it("returns undefined for unknown status", () => {
    expect(resolveStatusDef(blogStatusConfig, "unknown")).toBeUndefined();
  });

  it("correctly marks published as public", () => {
    const def = resolveStatusDef(blogStatusConfig, "published");
    expect(def?.isPublic).toBe(true);
  });
});

describe("isValidTransition", () => {
  it("allows valid transitions", () => {
    expect(isValidTransition(blogStatusConfig, "draft", "published")).toBe(true);
    expect(isValidTransition(blogStatusConfig, "published", "archived")).toBe(true);
    expect(isValidTransition(blogStatusConfig, "archived", "draft")).toBe(true);
  });

  it("rejects invalid transitions", () => {
    expect(isValidTransition(blogStatusConfig, "archived", "published")).toBe(false);
    expect(isValidTransition(blogStatusConfig, "draft", "draft")).toBe(false);
  });

  it("handles unknown status gracefully", () => {
    expect(isValidTransition(blogStatusConfig, "unknown" as BlogStatus, "draft")).toBe(false);
  });
});
