import { Star, Check, X, Trash2 }       from "lucide-react";
import { ResourceStatusBadge }           from "@/components/cms/engine";
import { buildCacheConfig }              from "@/lib/cms/cache";
import { CACHE_TAGS }                    from "@/lib/cache";
import type { CmsResourceConfig, CmsStatusConfig } from "@/lib/cms/types";
import type { ReviewRecord, ReviewStatus } from "../service/reviews.service";
import type { ReviewService }             from "../service/reviews.service";

export const REVIEW_CACHE = buildCacheConfig(CACHE_TAGS.reviews, true);

type RS = ReviewStatus;
export const reviewStatusConfig: CmsStatusConfig<RS> = {
  field:         "status",
  defaultStatus: "pending",
  definitions: [
    { value: "pending",  label: "Pending",  badgeVariant: "warning", allowedTransitions: ["approved","rejected"] },
    { value: "approved", label: "Approved", badgeVariant: "success", allowedTransitions: ["rejected"],  isPublic: true },
    { value: "rejected", label: "Rejected", badgeVariant: "error",   allowedTransitions: ["approved"] },
  ],
};

const STATUS_DEF: Record<RS, (typeof reviewStatusConfig.definitions)[0]> = Object.fromEntries(
  reviewStatusConfig.definitions.map(d => [d.value, d])
) as Record<RS, (typeof reviewStatusConfig.definitions)[0]>;

export const reviewConfig: CmsResourceConfig<ReviewRecord, RS> = {
  meta:    { label: "Review", labelPlural: "Reviews", icon: Star },
  routes:  { apiPath: "/api/reviews", adminPath: "/admin/reviews" },
  permissions: { read: "reviews.read", create: "reviews.read", update: "reviews.update", delete: "reviews.update" },
  status:  reviewStatusConfig,
  cache:   REVIEW_CACHE,
  audit:   { resourceName: "review" },
  table: {
    displayField: "patientName",
    search: { placeholder: "Search reviews…", fields: ["patientName","comment"] },
    filters: [
      { key: "status", label: "Status", type: "status",
        options: [{ label:"Pending", value:"pending" }, { label:"Approved", value:"approved" }, { label:"Rejected", value:"rejected" }] },
    ],
    columns: [
      { key: "patient", header: "Patient",  sortable: true, cell: r => r.patientName },
      { key: "rating",  header: "Rating",                  cell: r => `${r.rating}/5` },
      { key: "comment", header: "Comment",  responsive: true, cell: r => r.comment },
      { key: "status",  header: "Status",                  cell: r => <ResourceStatusBadge definition={STATUS_DEF[r.status as RS]} /> },
    ],
  },
  actions: [
    { id: "approve", label: "Approve", icon: Check, scope: ["row"], permission: "reviews.update",
      isAvailable: r => r.status !== "approved",
      executor: async (r, s) => {
        const svc = s as ReviewService; await svc.approve(r.id);
      },
    },
    { id: "reject", label: "Reject", icon: X, scope: ["row"], permission: "reviews.update", destructive: true,
      isAvailable: r => r.status !== "rejected",
      confirm: { title: "Reject review?", description: r => `Reject ${r.patientName}'s review?` },
      executor: async (r, s) => {
        const svc = s as ReviewService; await svc.reject(r.id);
      },
    },
  ],
};
