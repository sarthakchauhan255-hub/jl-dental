import { Stethoscope, Eye, EyeOff, Star, StarOff, Pencil, Trash2 } from "lucide-react";
import { ResourceStatusBadge }  from "@/components/cms/engine";
import { buildCacheConfig }     from "@/lib/cms/cache";
import { CACHE_TAGS }           from "@/lib/cache";
import type { CmsResourceConfig } from "@/lib/cms/types";
import type { ServiceRecord }   from "../service/services.service";

export const SERVICE_CACHE = buildCacheConfig(CACHE_TAGS.services, true);

export const serviceConfig: CmsResourceConfig<ServiceRecord> = {
  meta:    { label: "Service", labelPlural: "Services", icon: Stethoscope },
  routes:  { apiPath: "/api/services", adminPath: "/admin/services" },
  permissions: { read: "services.read", create: "services.create", update: "services.update", delete: "services.delete" },
  cache:   SERVICE_CACHE,
  audit:   { resourceName: "service", excludeFromDiff: ["coverImage"] },
  table: {
    displayField: "name",
    search: { placeholder: "Search services…", fields: ["name","shortDesc"] },
    columns: [
      { key: "name",     header: "Name",     sortable: true, cell: r => r.name },
      { key: "featured", header: "Featured",               cell: r => r.isFeatured ? <ResourceStatusBadge active definition={{ value:"featured", label:"Featured", badgeVariant:"success", allowedTransitions:[] }} /> : null },
      { key: "status",   header: "Status",                 cell: r => <ResourceStatusBadge active={r.isActive} /> },
      { key: "order",    header: "Order",    sortable: true, responsive: true, cell: r => r.order },
    ],
  },
  actions: [
    { id: "activate",   label: "Activate",   icon: Eye,     scope: ["row"], permission: "services.update", isAvailable: r => !r.isActive,   executor: async (r,s) => { await s.update(r.id, {isActive:true});  } },
    { id: "deactivate", label: "Deactivate", icon: EyeOff,  scope: ["row"], permission: "services.update", isAvailable: r => r.isActive,    executor: async (r,s) => { await s.update(r.id, {isActive:false}); } },
    { id: "feature",    label: "Feature",    icon: Star,    scope: ["row"], permission: "services.update", isAvailable: r => !r.isFeatured,  executor: async (r,s) => { await s.update(r.id, {isFeatured:true});  } },
    { id: "unfeature",  label: "Unfeature",  icon: StarOff, scope: ["row"], permission: "services.update", isAvailable: r => !!r.isFeatured, executor: async (r,s) => { await s.update(r.id, {isFeatured:false}); } },
    { id: "delete", label: "Delete", icon: Trash2, scope: ["row","bulk"], permission: "services.delete", destructive: true,
      confirm: { title: "Delete service?", description: r => `"${r.name}" will be permanently deleted.` },
      executor: async (r,s) => { await s.delete(r.id); },
      bulkExecutor: async (rs,s) => { await s.bulkDelete(rs.map(r=>r.id)); },
    },
  ],
};
