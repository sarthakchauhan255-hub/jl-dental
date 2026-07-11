/**
 * Resource DTO mappers.
 *
 * Every mapper: lean() result → asLean() (single widening) → typed DTO.
 * API routes and admin pages call these — never field-by-field assertions.
 */
import {
  asLean, serializeObjectId, serializeOptionalDate, serializeNullableDate,
  normalizeMediaAsset, normalizeSeoMetadata, str, num, bool, strArray,
  type MediaAssetDto, type SeoDto,
} from "../serializers";

// ─── Doctor ───────────────────────────────────────────────────────────────────
export interface DoctorDto {
  id: string; name: string; slug: string; specialization: string;
  qualifications: string[]; bio: string; order: number; isActive: boolean;
  photo: MediaAssetDto | null; seo: SeoDto;
  createdAt?: string; updatedAt?: string;
  [key: string]: unknown;
}

export function mapDoctor(raw: unknown): DoctorDto {
  const d = asLean(raw);
  return {
    id:             serializeObjectId(d._id),
    name:           str(d.name),
    slug:           str(d.slug),
    specialization: str(d.specialization),
    qualifications: strArray(d.qualifications),
    bio:            str(d.bio),
    order:          num(d.order),
    isActive:       bool(d.isActive),
    photo:          normalizeMediaAsset(d.photo),
    seo:            normalizeSeoMetadata(d.seo),
    createdAt:      serializeOptionalDate(d.createdAt),
    updatedAt:      serializeOptionalDate(d.updatedAt),
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────
export interface ServiceDto {
  id: string; name: string; slug: string; shortDesc: string; fullContent: string;
  icon: string; order: number; isActive: boolean; isFeatured: boolean;
  coverImage: MediaAssetDto | null; seo: SeoDto;
  createdAt?: string; updatedAt?: string;
  [key: string]: unknown;
}

export function mapService(raw: unknown): ServiceDto {
  const d = asLean(raw);
  return {
    id:          serializeObjectId(d._id),
    name:        str(d.name),
    slug:        str(d.slug),
    shortDesc:   str(d.shortDesc),
    fullContent: str(d.fullContent),
    icon:        str(d.icon),
    order:       num(d.order),
    isActive:    bool(d.isActive),
    isFeatured:  bool(d.isFeatured),
    coverImage:  normalizeMediaAsset(d.coverImage),
    seo:         normalizeSeoMetadata(d.seo),
    createdAt:   serializeOptionalDate(d.createdAt),
    updatedAt:   serializeOptionalDate(d.updatedAt),
  };
}

// ─── BlogPost ─────────────────────────────────────────────────────────────────
export interface BlogPostDto {
  id: string; title: string; slug: string; status: string;
  excerpt: string; content: string; author: string; category: string;
  tags: string[]; coverImage: MediaAssetDto | null;
  publishedAt: string | null; seo: SeoDto;
  createdAt?: string; updatedAt?: string;
  [key: string]: unknown;
}

export function mapBlogPost(raw: unknown): BlogPostDto {
  const d = asLean(raw);
  return {
    id:          serializeObjectId(d._id),
    title:       str(d.title),
    slug:        str(d.slug),
    status:      str(d.status, "draft"),
    excerpt:     str(d.excerpt),
    content:     str(d.content),
    author:      str(d.author),
    category:    str(d.category, "General"),
    tags:        strArray(d.tags),
    coverImage:  normalizeMediaAsset(d.coverImage),
    publishedAt: serializeNullableDate(d.publishedAt),
    seo:         normalizeSeoMetadata(d.seo),
    createdAt:   serializeOptionalDate(d.createdAt),
    updatedAt:   serializeOptionalDate(d.updatedAt),
  };
}

// ─── Gallery ──────────────────────────────────────────────────────────────────
export interface GalleryDto {
  id: string; type: string; category: string; caption: string;
  order: number; isActive: boolean;
  before: MediaAssetDto | null; after: MediaAssetDto | null; image: MediaAssetDto | null;
  createdAt?: string; updatedAt?: string;
  [key: string]: unknown;
}

export function mapGallery(raw: unknown): GalleryDto {
  const d = asLean(raw);
  return {
    id:        serializeObjectId(d._id),
    type:      str(d.type, "general"),
    category:  str(d.category, "General"),
    caption:   str(d.caption),
    order:     num(d.order),
    isActive:  bool(d.isActive),
    before:    normalizeMediaAsset(d.before),
    after:     normalizeMediaAsset(d.after),
    image:     normalizeMediaAsset(d.image),
    createdAt: serializeOptionalDate(d.createdAt),
    updatedAt: serializeOptionalDate(d.updatedAt),
  };
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
export interface FaqDto {
  id: string; question: string; answer: string; category: string;
  order: number; isActive: boolean;
  createdAt?: string; updatedAt?: string;
  [key: string]: unknown;
}

export function mapFaq(raw: unknown): FaqDto {
  const d = asLean(raw);
  return {
    id:        serializeObjectId(d._id),
    question:  str(d.question),
    answer:    str(d.answer),
    category:  str(d.category, "General"),
    order:     num(d.order),
    isActive:  bool(d.isActive),
    createdAt: serializeOptionalDate(d.createdAt),
    updatedAt: serializeOptionalDate(d.updatedAt),
  };
}

// ─── Review ───────────────────────────────────────────────────────────────────
export interface ReviewDto {
  id: string; patientName: string; rating: number; comment: string;
  status: string; source: string;
  createdAt?: string; updatedAt?: string;
  [key: string]: unknown;
}

export function mapReview(raw: unknown): ReviewDto {
  const d = asLean(raw);
  return {
    id:          serializeObjectId(d._id),
    patientName: str(d.patientName),
    rating:      num(d.rating),
    comment:     str(d.comment),
    status:      str(d.status, "pending"),
    source:      str(d.source, "website"),
    createdAt:   serializeOptionalDate(d.createdAt),
    updatedAt:   serializeOptionalDate(d.updatedAt),
  };
}

// ─── Appointment ──────────────────────────────────────────────────────────────
/** List DTO — PII-minimized: no email/phone. */
export interface AppointmentListDto {
  id: string; patientName: string; service: string;
  preferredDate: string; preferredTime: string; status: string;
  confirmedDate: string | null; confirmedTime: string | null;
  createdAt?: string; updatedAt?: string;
  [key: string]: unknown;
}

export function mapAppointmentList(raw: unknown): AppointmentListDto {
  const d = asLean(raw);
  return {
    id:            serializeObjectId(d._id),
    patientName:   str(d.patientName),
    service:       str(d.serviceId ?? d.service),
    preferredDate: str(d.preferredDate),
    preferredTime: str(d.preferredTime),
    status:        str(d.status, "pending"),
    confirmedDate: typeof d.confirmedDate === "string" ? d.confirmedDate : null,
    confirmedTime: typeof d.confirmedTime === "string" ? d.confirmedTime : null,
    createdAt:     serializeOptionalDate(d.createdAt),
    updatedAt:     serializeOptionalDate(d.updatedAt),
  };
}

/** Detail DTO — includes PII (admin detail view ONLY, never list/audit). */
export interface AppointmentDetailDto extends AppointmentListDto {
  email: string; phone: string; urgencyLevel: string;
  message: string; notes: string;
}

export function mapAppointmentDetail(raw: unknown): AppointmentDetailDto {
  const d = asLean(raw);
  return {
    ...mapAppointmentList(raw),
    email:        str(d.email),
    phone:        str(d.phone),
    urgencyLevel: str(d.urgencyLevel, "normal"),
    message:      str(d.message),
    notes:        str(d.notes),
  };
}

// ─── Clinic ───────────────────────────────────────────────────────────────────
export interface ClinicDto {
  id: string; name: string; tagline: string; description: string;
  contact: Record<string, unknown>; workingHours: unknown;
  social: Record<string, unknown>; seo: SeoDto;
  logo: MediaAssetDto | null;
  updatedAt?: string;
  [key: string]: unknown;
}

export function mapClinic(raw: unknown): ClinicDto {
  const d = asLean(raw);
  return {
    id:           serializeObjectId(d._id),
    name:         str(d.name),
    tagline:      str(d.tagline),
    description:  str(d.description),
    contact:      (d.contact  ?? {}) as Record<string, unknown>,
    workingHours: d.workingHours ?? [],
    social:       (d.social   ?? {}) as Record<string, unknown>,
    seo:          normalizeSeoMetadata(d.seo),
    logo:         normalizeMediaAsset(d.logo),
    updatedAt:    serializeOptionalDate(d.updatedAt),
  };
}
