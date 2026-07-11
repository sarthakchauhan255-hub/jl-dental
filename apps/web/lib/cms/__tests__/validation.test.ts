/**
 * CMS Validation Tests
 */
import { z } from "zod";
import { validateWithSchema, generateSlug, isValidSlug, coerceEmpty } from "../validation";

describe("validateWithSchema", () => {
  const schema = z.object({ name: z.string().min(1), order: z.number().int() });

  it("returns valid:true with parsed data", () => {
    const result = validateWithSchema(schema, { name: "Test", order: 0 });
    expect(result.valid).toBe(true);
    if (result.valid) expect(result.data.name).toBe("Test");
  });

  it("returns valid:false with field errors", () => {
    const result = validateWithSchema(schema, { name: "", order: 1.5 });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.name).toBeDefined();
      expect(result.errors.order).toBeDefined();
    }
  });
});

describe("generateSlug", () => {
  it("converts spaces to hyphens", () => {
    expect(generateSlug("Hello World")).toBe("hello-world");
  });
  it("removes special characters", () => {
    expect(generateSlug("Dr. Jane Smith!")).toBe("dr-jane-smith");
  });
  it("collapses multiple hyphens", () => {
    expect(generateSlug("hello---world")).toBe("hello-world");
  });
  it("trims leading/trailing hyphens", () => {
    expect(generateSlug("  hello  ")).toBe("hello");
  });
  it("truncates to 120 chars", () => {
    const long = "a".repeat(200);
    expect(generateSlug(long).length).toBeLessThanOrEqual(120);
  });
});

describe("isValidSlug", () => {
  it("accepts valid slugs", () => {
    expect(isValidSlug("hello-world")).toBe(true);
    expect(isValidSlug("dr-jane-smith")).toBe(true);
  });
  it("rejects uppercase", () => {
    expect(isValidSlug("Hello-World")).toBe(false);
  });
  it("rejects spaces", () => {
    expect(isValidSlug("hello world")).toBe(false);
  });
  it("rejects single char", () => {
    expect(isValidSlug("a")).toBe(false);
  });
});

describe("coerceEmpty", () => {
  it("converts empty strings to undefined", () => {
    const result = coerceEmpty({ name: "Test", bio: "", email: null });
    expect(result.name).toBe("Test");
    expect(result.bio).toBeUndefined();
    expect(result.email).toBeUndefined();
  });
});
