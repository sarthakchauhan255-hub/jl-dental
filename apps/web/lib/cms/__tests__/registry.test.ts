/**
 * CMS Registry Tests — invariant validation + heterogeneous storage
 */
import { describe, it, expect, beforeEach } from "vitest";
import { registerCmsResource, getCmsResourceMeta, hasCmsResource, validateResourceConfig } from "../registry";
import type { CmsResourceConfig, CmsRecord } from "../types";

// Minimal icon placeholder
const Icon = {} as unknown as import("lucide-react").LucideIcon;

interface WidgetRecord extends CmsRecord { name: string }
interface TwoRecord   extends CmsRecord { title: string }

const baseConfig = (overrides: Partial<CmsResourceConfig<WidgetRecord>> = {}): CmsResourceConfig<WidgetRecord> => ({
  meta:        { label: "Widget", labelPlural: "Widgets", icon: Icon },
  routes:      { apiPath: "/api/widgets", adminPath: "/admin/widgets" },
  permissions: { read: "services.read", create: "services.create", update: "services.update", delete: "services.delete" },
  table: {
    displayField: "name",
    columns: [{ key: "name", header: "Name", cell: r => r.name }],
  },
  cache:       { tags: ["widgets"] },
  ...overrides,
});

// The registry is a module-level singleton — reset between tests by using unique IDs
let counter = 0;
function uniqueId() { return `widget-${++counter}`; }

describe("registerCmsResource + getCmsResourceMeta", () => {
  it("registers a valid config and stores non-generic metadata", () => {
    const id = uniqueId();
    registerCmsResource(id, baseConfig({ routes: { apiPath: `/api/${id}`, adminPath: `/admin/${id}` } }));
    expect(hasCmsResource(id)).toBe(true);
    const meta = getCmsResourceMeta(id);
    expect(meta?.label).toBe("Widget");
    expect(meta?.apiPath).toBe(`/api/${id}`);
    expect(meta?.cacheTags).toContain("widgets");
  });

  it("rejects duplicate resource IDs", () => {
    const id = uniqueId();
    registerCmsResource(id, baseConfig({ routes: { apiPath: `/api/${id}`, adminPath: `/admin/${id}` } }));
    expect(() => registerCmsResource(id, baseConfig({ routes: { apiPath: `/api/${id}b`, adminPath: `/admin/${id}b` } })))
      .toThrow("Duplicate resource ID");
  });

  it("rejects duplicate adminPath across different resource IDs", () => {
    const id1 = uniqueId();
    const id2 = uniqueId();
    const sharedAdminPath = `/admin/shared-${counter}`;
    registerCmsResource(id1, baseConfig({ routes: { apiPath: `/api/${id1}`, adminPath: sharedAdminPath } }));
    expect(() =>
      registerCmsResource(id2, baseConfig({ routes: { apiPath: `/api/${id2}`, adminPath: sharedAdminPath } }))
    ).toThrow("Duplicate adminPath");
  });

  it("rejects duplicate apiPath across different resource IDs", () => {
    const id1 = uniqueId();
    const id2 = uniqueId();
    const sharedApiPath = `/api/shared-${counter}`;
    registerCmsResource(id1, baseConfig({ routes: { apiPath: sharedApiPath, adminPath: `/admin/${id1}` } }));
    expect(() =>
      registerCmsResource(id2, baseConfig({ routes: { apiPath: sharedApiPath, adminPath: `/admin/${id2}` } }))
    ).toThrow("Duplicate apiPath");
  });

  it("stores action IDs in runtime metadata", () => {
    const id = uniqueId();
    const cfg = baseConfig({
      routes:  { apiPath: `/api/${id}`, adminPath: `/admin/${id}` },
      actions: [
        { id: "approve", label: "Approve", scope: ["row"],
          executor: async () => { /* no-op */ } },
      ],
    });
    registerCmsResource(id, cfg);
    const meta = getCmsResourceMeta(id);
    expect(meta?.actionIds).toContain("approve");
  });

  it("stores status values in runtime metadata", () => {
    const id = uniqueId();
    const cfg = baseConfig({
      routes: { apiPath: `/api/${id}`, adminPath: `/admin/${id}` },
      status: {
        field:         "status" as keyof WidgetRecord,
        defaultStatus: "active" as const,
        definitions:   [
          { value: "active" as const, label: "Active", badgeVariant: "success" as const, allowedTransitions: [] },
        ],
      },
    });
    registerCmsResource(id, cfg);
    const meta = getCmsResourceMeta(id);
    expect(meta?.statusValues).toContain("active");
  });
});

describe("validateResourceConfig", () => {
  it("passes a valid config", () => {
    const id = uniqueId();
    expect(validateResourceConfig(id, baseConfig())).toHaveLength(0);
  });

  it("fails on missing meta.label", () => {
    const errors = validateResourceConfig("x", baseConfig({ meta: { label: "", labelPlural: "Widgets", icon: Icon } }));
    expect(errors.some(e => e.field === "meta.label")).toBe(true);
  });

  it("fails on apiPath without leading slash", () => {
    const errors = validateResourceConfig("x", baseConfig({ routes: { apiPath: "api/widgets", adminPath: "/admin/widgets" } }));
    expect(errors.some(e => e.field === "routes.apiPath")).toBe(true);
  });

  it("fails on empty columns array", () => {
    const errors = validateResourceConfig("x", baseConfig({ table: { displayField: "name", columns: [] } }));
    expect(errors.some(e => e.field === "table.columns")).toBe(true);
  });

  it("fails on duplicate column keys", () => {
    const errors = validateResourceConfig("x", baseConfig({
      table: {
        displayField: "name",
        columns: [
          { key: "name", header: "Name",  cell: r => r.name },
          { key: "name", header: "Name2", cell: r => r.name },
        ],
      },
    }));
    expect(errors.some(e => e.message.includes("Duplicate column keys"))).toBe(true);
  });

  it("fails on duplicate action IDs", () => {
    const errors = validateResourceConfig("x", baseConfig({
      actions: [
        { id: "approve", label: "Approve", scope: ["row"] },
        { id: "approve", label: "Approve2", scope: ["row"] },
      ],
    }));
    expect(errors.some(e => e.message.includes("Duplicate action IDs"))).toBe(true);
  });

  it("fails on duplicate form field names", () => {
    const errors = validateResourceConfig("x", baseConfig({
      form: {
        fields: [
          { name: "title", label: "Title", type: "text" },
          { name: "title", label: "Title2", type: "text" },
        ],
      },
    }));
    expect(errors.some(e => e.message.includes("Duplicate field names"))).toBe(true);
  });

  it("fails when status defaultStatus not found in definitions", () => {
    const errors = validateResourceConfig("x", baseConfig({
      status: {
        field:         "status" as keyof WidgetRecord,
        defaultStatus: "unknown" as "active",
        definitions:   [
          { value: "active" as const, label: "Active", badgeVariant: "success" as const, allowedTransitions: [] },
        ],
      },
    }));
    expect(errors.some(e => e.field === "status.defaultStatus")).toBe(true);
  });
});
