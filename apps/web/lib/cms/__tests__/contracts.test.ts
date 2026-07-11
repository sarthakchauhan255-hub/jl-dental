/**
 * CMS Contracts Tests
 *
 * Tests: ApiResourceService generic persistence primitives,
 *        softDelete throws when not implemented (resource must override)
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ApiResourceService } from "../contracts";
import type { CmsRecord }     from "../types";

interface WidgetRecord extends CmsRecord {
  name:   string;
  order?: number;
}

interface WidgetInput extends Record<string, unknown> {
  name:   string;
  order?: number;
}

// Concrete subclass — represents a real resource service
class WidgetService extends ApiResourceService<WidgetRecord, WidgetInput> {
  constructor() { super("/api/widgets"); }
}

function mockFetch(data: unknown, status = 200) {
  return vi.fn().mockResolvedValue({
    ok:     status >= 200 && status < 300,
    status,
    json:   () => Promise.resolve(data),
  });
}

describe("ApiResourceService", () => {
  let service: WidgetService;
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    service  = new WidgetService();
    fetchSpy = mockFetch({ data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } });
    vi.stubGlobal("fetch", fetchSpy);
  });

  it("findMany calls the correct URL", async () => {
    await service.findMany({ page: 2, limit: 5, q: "test" });
    const url = fetchSpy.mock.calls[0][0] as string;
    expect(url).toContain("/api/widgets");
    expect(url).toContain("page=2");
    expect(url).toContain("q=test");
  });

  it("findOne returns null on 404", async () => {
    vi.stubGlobal("fetch", mockFetch({}, 404));
    const result = await service.findOne("nonexistent");
    expect(result).toBeNull();
  });

  it("delete returns success on 204", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, status: 204, json: () => Promise.resolve({}) }));
    const result = await service.delete("abc");
    expect(result.success).toBe(true);
  });

  it("bulkDelete aggregates failures", async () => {
    let callCount = 0;
    vi.stubGlobal("fetch", vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 2) return Promise.reject(new Error("Network error"));
      return Promise.resolve({ ok: true, status: 204, json: () => Promise.resolve({}) });
    }));
    const result = await service.bulkDelete(["a", "b", "c"]);
    expect(result.success).toBe(false);
    expect(result.error).toContain("1 of 3");
  });

  it("softDelete throws when not overridden", async () => {
    await expect(service.softDelete("abc")).rejects.toThrow(
      "softDelete is not implemented for this resource"
    );
  });

  it("undoSoftDelete throws when not overridden", async () => {
    await expect(service.undoSoftDelete("abc")).rejects.toThrow(
      "undoSoftDelete is not implemented for this resource"
    );
  });

  it("resource-specific lifecycle is defined in the subclass", async () => {
    // Example: a resource that implements its own business lifecycle
    class BlogService extends ApiResourceService<WidgetRecord, WidgetInput> {
      constructor() { super("/api/blog"); }
      async publish(id: string) {
        return this.update(id, { name: "published" }); // uses domain-specific field
      }
    }
    const blog    = new BlogService();
    const blogSpy = mockFetch({ success: true, data: { id: "x", name: "published" } });
    vi.stubGlobal("fetch", blogSpy);
    const result  = await blog.publish("x");
    expect(result).toBeDefined();
    // Verify the PATCH was made with domain-specific fields (not business method names)
    const patchCall = blogSpy.mock.calls.find(
      (c: unknown[]) => typeof c[0] === "string" && (c[0] as string).includes("/api/blog")
    );
    expect(patchCall).toBeDefined();
    if (patchCall) expect((patchCall[1] as { body: string }).body).toContain("published");
  });
});
