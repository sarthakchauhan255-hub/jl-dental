/**
 * CMS Action Execution Tests
 *
 * Tests: uniform execution contract, no default delete dispatch,
 *        action visibility/enabled predicates, executor requirement
 */
import { describe, it, expect, vi } from "vitest";
import type { CmsActionDefinition, CmsRecord } from "../types";
import type { CmsResourceService }             from "../contracts";
import { createDeleteAction }                  from "../types";

interface TestRecord extends CmsRecord {
  name:   string;
  status: "pending" | "approved";
}

type TestService = Pick<CmsResourceService<TestRecord>, "update" | "delete" | "bulkDelete">;

// ─── Simulate the engine's executeViaExecutor ──────────────────────────────────
// We test the execution contract directly rather than mounting React components.
async function executeViaExecutor<T extends CmsRecord>(
  action:  CmsActionDefinition<T>,
  record:  T,
  service: CmsResourceService<T>,
): Promise<void> {
  if (!action.executor) {
    throw new Error(`Action "${action.id}" has no executor`);
  }
  await action.executor(record, service);
}

async function executeViaBulkExecutor<T extends CmsRecord>(
  action:  CmsActionDefinition<T>,
  records: T[],
  service: CmsResourceService<T>,
): Promise<void> {
  if (action.bulkExecutor) {
    await action.bulkExecutor(records, service);
    return;
  }
  await Promise.all(records.map(r => executeViaExecutor(action, r, service)));
}

describe("Uniform execution contract — no hardcoded action IDs", () => {
  it("throws for any action without an executor (including 'delete')", async () => {
    const noExecutorAction: CmsActionDefinition<TestRecord> = {
      id:    "delete",
      label: "Delete",
      scope: ["row"],
      // No executor — resource forgot to provide one
    };
    const record  = { id: "1", name: "X", status: "pending" } as TestRecord;
    const service = { delete: vi.fn() } as unknown as CmsResourceService<TestRecord>;

    await expect(executeViaExecutor(noExecutorAction, record, service))
      .rejects.toThrow("no executor");
    // Critical: service.delete was NOT called — no implicit dispatch
    expect(service.delete).not.toHaveBeenCalled();
  });

  it("executes a delete action via its resource-defined executor", async () => {
    const service = { delete: vi.fn().mockResolvedValue({ success: true }) } as unknown as CmsResourceService<TestRecord>;

    const deleteAction: CmsActionDefinition<TestRecord> = {
      id:       "delete",
      label:    "Delete",
      scope:    ["row", "bulk"],
      executor: async (r, svc) => { await svc.delete(r.id); },
    };

    const record = { id: "abc", name: "Widget", status: "pending" } as TestRecord;
    await executeViaExecutor(deleteAction, record, service);

    expect(service.delete).toHaveBeenCalledOnce();
    expect(service.delete).toHaveBeenCalledWith("abc");
  });

  it("executes approve (non-delete) action via the SAME contract as delete", async () => {
    const service = {
      update: vi.fn().mockResolvedValue({ success: true }),
    } as unknown as CmsResourceService<TestRecord>;

    const approveAction: CmsActionDefinition<TestRecord> = {
      id:       "approve",
      label:    "Approve",
      scope:    ["row"],
      executor: async (r, svc) => { await svc.update(r.id, { status: "approved" } as unknown as Partial<TestRecord>); },
    };

    const record = { id: "xyz", name: "Review", status: "pending" } as TestRecord;
    await executeViaExecutor(approveAction, record, service);

    expect(service.update).toHaveBeenCalledWith("xyz", { status: "approved" });
  });

  it("delete and approve use identical execution mechanics — no branching by ID", async () => {
    // Both go through action.executor — no switch, no special case
    const service = {
      delete: vi.fn().mockResolvedValue({ success: true }),
      update: vi.fn().mockResolvedValue({ success: true }),
    } as unknown as CmsResourceService<TestRecord>;

    const record = { id: "1", name: "Test", status: "pending" } as TestRecord;

    const deleteAction: CmsActionDefinition<TestRecord> = {
      id: "delete", label: "Delete", scope: ["row"],
      executor: async (r, svc) => { await svc.delete(r.id); },
    };
    const approveAction: CmsActionDefinition<TestRecord> = {
      id: "approve", label: "Approve", scope: ["row"],
      executor: async (r, svc) => { await svc.update(r.id, { status: "approved" } as unknown as Partial<TestRecord>); },
    };

    // Same call site, same code path
    await executeViaExecutor(deleteAction, record, service);
    await executeViaExecutor(approveAction, record, service);

    expect(service.delete).toHaveBeenCalledOnce();
    expect(service.update).toHaveBeenCalledOnce();
  });
});

describe("Bulk execution contract", () => {
  it("bulk executor used when provided", async () => {
    const service = {
      bulkDelete: vi.fn().mockResolvedValue({ success: true }),
    } as unknown as CmsResourceService<TestRecord>;

    const bulkDeleteAction: CmsActionDefinition<TestRecord> = {
      id:           "delete",
      label:        "Delete",
      scope:        ["bulk"],
      bulkExecutor: async (records, svc) => {
        await svc.bulkDelete(records.map(r => r.id));
      },
    };

    const records = [
      { id: "a", name: "A", status: "pending" },
      { id: "b", name: "B", status: "pending" },
    ] as TestRecord[];

    await executeViaBulkExecutor(bulkDeleteAction, records, service);
    expect(service.bulkDelete).toHaveBeenCalledWith(["a","b"]);
  });

  it("falls back to per-record executor when bulkExecutor absent", async () => {
    const service = {
      update: vi.fn().mockResolvedValue({ success: true }),
    } as unknown as CmsResourceService<TestRecord>;

    const approveAll: CmsActionDefinition<TestRecord> = {
      id:       "approve",
      label:    "Approve All",
      scope:    ["bulk"],
      executor: async (r, svc) => { await svc.update(r.id, { status: "approved" } as unknown as Partial<TestRecord>); },
    };

    const records = [
      { id: "1", name: "A", status: "pending" },
      { id: "2", name: "B", status: "pending" },
    ] as TestRecord[];

    await executeViaBulkExecutor(approveAll, records, service);
    expect(service.update).toHaveBeenCalledTimes(2);
  });
});

describe("createDeleteAction factory", () => {
  it("produces an action without an executor — resource must add one", () => {
    const factory = createDeleteAction<TestRecord>("name");
    expect(factory.id).toBe("delete");
    expect(factory.destructive).toBe(true);
    expect(factory.scope).toContain("row");
    expect(factory.scope).toContain("bulk");
    // executor is NOT pre-supplied by the factory — resource provides it
    expect(factory.executor).toBeUndefined();
  });

  it("generates confirm description from displayField", () => {
    const factory  = createDeleteAction<TestRecord>("name");
    const record   = { id: "1", name: "My Widget", status: "pending" } as TestRecord;
    const desc     = factory.confirm?.description(record);
    expect(desc).toContain("My Widget");
  });

  it("throws when factory action used without adding executor", async () => {
    const factory  = createDeleteAction<TestRecord>("name");
    const service  = { delete: vi.fn() } as unknown as CmsResourceService<TestRecord>;
    const record   = { id: "1", name: "X", status: "pending" } as TestRecord;

    await expect(executeViaExecutor(factory, record, service))
      .rejects.toThrow("no executor");
    expect(service.delete).not.toHaveBeenCalled();
  });
});

describe("Action visibility predicates", () => {
  it("isAvailable controls when an action appears", () => {
    const action: CmsActionDefinition<TestRecord> = {
      id:          "approve",
      label:       "Approve",
      scope:       ["row"],
      isAvailable: r => r.status === "pending",
    };
    const pending  = { id: "1", name: "X", status: "pending" }  as TestRecord;
    const approved = { id: "2", name: "Y", status: "approved" } as TestRecord;
    expect(action.isAvailable!(pending)).toBe(true);
    expect(action.isAvailable!(approved)).toBe(false);
  });

  it("isEnabled controls whether an action is interactive", () => {
    const action: CmsActionDefinition<TestRecord> = {
      id:        "approve",
      label:     "Approve",
      scope:     ["row"],
      isEnabled: r => r.status !== "approved",
    };
    const pending  = { id: "1", name: "X", status: "pending" }  as TestRecord;
    const approved = { id: "2", name: "Y", status: "approved" } as TestRecord;
    expect(action.isEnabled!(pending)).toBe(true);
    expect(action.isEnabled!(approved)).toBe(false);
  });
});
