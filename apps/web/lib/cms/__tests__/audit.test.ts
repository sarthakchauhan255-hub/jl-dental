/**
 * CMS Audit Tests
 *
 * Tests: diffRecords, sensitive field sanitization
 */
import { diffRecords } from "../audit";

describe("diffRecords", () => {
  it("detects changed fields", () => {
    const prev = { name: "Old Name", bio: "Old bio" };
    const next = { name: "New Name", bio: "Old bio" };
    const diff = diffRecords(prev, next);
    expect(diff.name).toEqual({ from: "Old Name", to: "New Name" });
    expect(diff.bio).toBeUndefined();
  });

  it("excludes sensitive fields by default", () => {
    const prev = { name: "Doc", password: "secret123", token: "abc" };
    const next = { name: "Doc", password: "newSecret", token: "xyz" };
    const diff = diffRecords(prev, next);
    expect(diff.password).toBeUndefined();
    expect(diff.token).toBeUndefined();
  });

  it("excludes custom fields via excludeFields", () => {
    const prev = { name: "Old", internalNote: "do not expose" };
    const next = { name: "New", internalNote: "different" };
    const diff = diffRecords(prev, next, ["internalNote"]);
    expect(diff.internalNote).toBeUndefined();
    expect(diff.name).toBeDefined();
  });

  it("excludes timestamp fields", () => {
    const prev = { name: "X", updatedAt: "2024-01-01" };
    const next = { name: "X", updatedAt: "2024-06-01" };
    const diff = diffRecords(prev, next);
    expect(diff.updatedAt).toBeUndefined();
  });

  it("detects new fields added", () => {
    const prev: Record<string, unknown> = { name: "A" };
    const next: Record<string, unknown> = { name: "A", newField: "hello" };
    const diff = diffRecords(prev, next);
    expect(diff.newField).toEqual({ from: undefined, to: "hello" });
  });

  it("returns empty object when nothing changed", () => {
    const prev = { name: "Same", count: 5 };
    const next = { name: "Same", count: 5 };
    expect(Object.keys(diffRecords(prev, next))).toHaveLength(0);
  });
});
