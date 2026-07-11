/**
 * Unit tests for the typed lean() → DTO mapper boundary (Stage 8).
 * These test the REAL mapping code — no DB required.
 */
import { describe, it, expect } from "vitest";
import {
  serializeObjectId, serializeDate, serializeOptionalDate, serializeNullableDate,
  normalizeMediaAsset, normalizeSeoMetadata, str, num, bool, strArray,
} from "../serializers";
import {
  mapDoctor, mapService, mapBlogPost, mapGallery, mapFaq, mapReview,
  mapAppointmentList, mapAppointmentDetail, mapClinic,
} from "../mappers";

describe("serialization primitives", () => {
  it("serializeObjectId stringifies ObjectId-like values", () => {
    expect(serializeObjectId("652f1f77bcf86cd799439011")).toBe("652f1f77bcf86cd799439011");
    expect(serializeObjectId({ toString: () => "abc" })).toBe("abc");
  });

  it("serializeDate handles Date and non-Date", () => {
    const d = new Date("2026-01-15T10:00:00.000Z");
    expect(serializeDate(d)).toBe("2026-01-15T10:00:00.000Z");
    expect(serializeDate(undefined)).toBe("");
  });

  it("serializeOptionalDate returns undefined for missing values", () => {
    expect(serializeOptionalDate(new Date("2026-01-01T00:00:00Z"))).toBe("2026-01-01T00:00:00.000Z");
    expect(serializeOptionalDate(undefined)).toBeUndefined();
    expect(serializeOptionalDate(null)).toBeUndefined();
    expect(serializeOptionalDate("2026-02-02")).toBe("2026-02-02");
  });

  it("serializeNullableDate returns null for missing values", () => {
    expect(serializeNullableDate(null)).toBeNull();
    expect(serializeNullableDate(undefined)).toBeNull();
    expect(serializeNullableDate(new Date("2026-03-03T00:00:00Z"))).toBe("2026-03-03T00:00:00.000Z");
  });

  it("normalizeMediaAsset accepts valid asset, rejects malformed", () => {
    expect(normalizeMediaAsset({ url: "https://cdn/x.jpg", publicId: "p1" }))
      .toEqual({ url: "https://cdn/x.jpg", publicId: "p1" });
    expect(normalizeMediaAsset({ url: "https://cdn/x.jpg", publicId: "p1", alt: "A" }))
      .toEqual({ url: "https://cdn/x.jpg", publicId: "p1", alt: "A" });
    expect(normalizeMediaAsset(null)).toBeNull();
    expect(normalizeMediaAsset({ url: "only-url" })).toBeNull();
    expect(normalizeMediaAsset({ publicId: 42, url: "x" })).toBeNull();
    expect(normalizeMediaAsset("string")).toBeNull();
  });

  it("normalizeSeoMetadata keeps only string fields", () => {
    expect(normalizeSeoMetadata({ title: "T", description: "D", junk: 1 }))
      .toEqual({ title: "T", description: "D" });
    expect(normalizeSeoMetadata(null)).toEqual({});
    expect(normalizeSeoMetadata({ title: 99 })).toEqual({});
  });

  it("str/num/bool/strArray coerce safely with fallbacks", () => {
    expect(str(undefined, "fb")).toBe("fb");
    expect(str("x")).toBe("x");
    expect(num("not-a-number", 7)).toBe(7);
    expect(num(3)).toBe(3);
    expect(bool(undefined)).toBe(false);
    expect(bool(true)).toBe(true);
    expect(strArray(["a", 1, "b", null])).toEqual(["a", "b"]);
    expect(strArray("not-array")).toEqual([]);
  });
});

describe("resource mappers", () => {
  const OID = "652f1f77bcf86cd799439011";
  const NOW = new Date("2026-06-01T12:00:00.000Z");

  it("mapDoctor produces a complete typed DTO", () => {
    const dto = mapDoctor({
      _id: OID, name: "Dr X", slug: "dr-x", specialization: "Ortho",
      qualifications: ["BDS", "MDS"], bio: "b", order: 2, isActive: true,
      photo: { url: "https://cdn/p.jpg", publicId: "jl/doctors/p" },
      seo: { title: "T" }, createdAt: NOW, updatedAt: NOW,
    });
    expect(dto.id).toBe(OID);
    expect(dto.photo?.publicId).toBe("jl/doctors/p");
    expect(dto.qualifications).toEqual(["BDS", "MDS"]);
    expect(dto.createdAt).toBe("2026-06-01T12:00:00.000Z");
  });

  it("mapDoctor is resilient to missing/malformed fields", () => {
    const dto = mapDoctor({ _id: OID });
    expect(dto.name).toBe("");
    expect(dto.photo).toBeNull();
    expect(dto.isActive).toBe(false);
    expect(dto.qualifications).toEqual([]);
  });

  it("mapService normalizes coverImage and defaults", () => {
    const dto = mapService({ _id: OID, name: "S", slug: "s", shortDesc: "d",
      order: 1, isActive: true, coverImage: { url: "u", publicId: "p" } });
    expect(dto.coverImage).toEqual({ url: "u", publicId: "p" });
    expect(dto.isFeatured).toBe(false);
    expect(dto.fullContent).toBe("");
  });

  it("mapBlogPost handles publishedAt Date | null", () => {
    const published = mapBlogPost({ _id: OID, title: "t", slug: "s", status: "published",
      publishedAt: new Date("2026-04-01T00:00:00Z") });
    expect(published.publishedAt).toBe("2026-04-01T00:00:00.000Z");

    const draft = mapBlogPost({ _id: OID, title: "t2", slug: "s2", status: "draft", publishedAt: null });
    expect(draft.publishedAt).toBeNull();
    expect(draft.status).toBe("draft");
  });

  it("mapGallery maps all three asset slots independently", () => {
    const dto = mapGallery({ _id: OID, type: "before_after", order: 1, isActive: true,
      before: { url: "b", publicId: "pb" }, after: { url: "a", publicId: "pa" }, image: null });
    expect(dto.before?.publicId).toBe("pb");
    expect(dto.after?.publicId).toBe("pa");
    expect(dto.image).toBeNull();
  });

  it("mapFaq / mapReview provide safe defaults", () => {
    expect(mapFaq({ _id: OID }).category).toBe("General");
    expect(mapReview({ _id: OID }).status).toBe("pending");
    expect(mapReview({ _id: OID, rating: 4 }).rating).toBe(4);
  });

  it("mapAppointmentList EXCLUDES PII (email/phone/message/notes)", () => {
    const dto = mapAppointmentList({
      _id: OID, patientName: "P", email: "p@x.com", phone: "+911234",
      message: "secret", notes: "internal",
      preferredDate: "2026-08-01", preferredTime: "morning", status: "pending",
    });
    expect(dto.patientName).toBe("P");
    expect(dto).not.toHaveProperty("email");
    expect(dto).not.toHaveProperty("phone");
    expect(dto).not.toHaveProperty("message");
    expect(dto).not.toHaveProperty("notes");
  });

  it("mapAppointmentDetail INCLUDES PII fields (admin detail only)", () => {
    const dto = mapAppointmentDetail({
      _id: OID, patientName: "P", email: "p@x.com", phone: "+911234",
      message: "msg", notes: "note", urgencyLevel: "high",
      preferredDate: "2026-08-01", preferredTime: "morning", status: "pending",
    });
    expect(dto.email).toBe("p@x.com");
    expect(dto.phone).toBe("+911234");
    expect(dto.notes).toBe("note");
    expect(dto.urgencyLevel).toBe("high");
  });

  it("mapClinic passes logo through and defaults safely", () => {
    const dto = mapClinic({ _id: OID, name: "C",
      logo: { url: "https://cdn/l.png", publicId: "jl/clinic/l", alt: "Logo" } });
    expect(dto.logo).toEqual({ url: "https://cdn/l.png", publicId: "jl/clinic/l", alt: "Logo" });
    expect(mapClinic({ _id: OID }).logo).toBeNull();
  });
});
