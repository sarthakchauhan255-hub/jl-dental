/**
 * Doctors CMS resource configuration.
 *
 * Reference implementation for all subsequent CMS resources.
 * All business behavior is defined here — the generic engine has no knowledge of Doctors.
 */
import { UserRound, Pencil, Trash2, Eye, EyeOff }  from "lucide-react";
import { Badge }                from "@/components/ui/badge";
import { ResourceStatusBadge } from "@/components/cms/engine";
import { buildCacheConfig }     from "@/lib/cms/cache";
import { CACHE_TAGS }           from "@/lib/cache";
import { generateSlug }         from "@/lib/cms/validation";
import type { CmsResourceConfig } from "@/lib/cms/types";
import type { DoctorRecord }      from "../service/doctors.service";

export const DOCTOR_CACHE = buildCacheConfig(
  CACHE_TAGS.doctors,
  /* appearsOnHomepage */ true
);

export const doctorConfig: CmsResourceConfig<DoctorRecord> = {
  meta: {
    label:       "Doctor",
    labelPlural: "Doctors",
    icon:        UserRound,
  },
  routes: {
    apiPath:   "/api/doctors",
    adminPath: "/admin/doctors",
  },
  permissions: {
    read:   "doctors.read",
    create: "doctors.create",
    update: "doctors.update",
    delete: "doctors.delete",
  },
  cache: DOCTOR_CACHE,
  audit: {
    resourceName:    "doctor",
    excludeFromDiff: ["photo"],  // large object; log change event only
  },
  table: {
    displayField: "name",
    search: {
      placeholder: "Search doctors by name or specialization…",
      fields:      ["name", "specialization"],
    },
    defaultSort: { field: "order", direction: "asc" },
    filters: [
      {
        key:  "isActive",
        label:"Status",
        type: "status",
        options: [
          { label: "Active",   value: "true"  },
          { label: "Inactive", value: "false" },
        ],
      },
    ],
    columns: [
      {
        key:      "name",
        header:   "Name",
        sortable: true,
        cell:     r => r.name,
      },
      {
        key:    "specialization",
        header: "Specialization",
        cell:   r => r.specialization,
      },
      {
        key:    "order",
        header: "Order",
        sortable: true,
        responsive: true,
        cell:   r => r.order,
      },
      {
        key:    "status",
        header: "Status",
        cell:   r => <ResourceStatusBadge active={r.isActive} />,
      },
    ],
  },
  actions: [
    {
      id:          "activate",
      label:       "Activate",
      icon:        Eye,
      scope:       ["row"],
      permission:  "doctors.update",
      isAvailable: r => !r.isActive,
      executor:    async (r, svc) => { await svc.update(r.id, { isActive: true }); },
    },
    {
      id:          "deactivate",
      label:       "Deactivate",
      icon:        EyeOff,
      scope:       ["row"],
      permission:  "doctors.update",
      isAvailable: r => r.isActive,
      executor:    async (r, svc) => { await svc.update(r.id, { isActive: false }); },
    },
    {
      id:          "edit",
      label:       "Edit",
      icon:        Pencil,
      scope:       ["row"],
      permission:  "doctors.update",
      executor:    async () => { /* navigation handled by onRowClick */ },
    },
    {
      id:          "delete",
      label:       "Delete",
      icon:        Trash2,
      scope:       ["row", "bulk"],
      permission:  "doctors.delete",
      destructive: true,
      confirm: {
        title:       "Delete doctor?",
        description: r => `"${r.name}" will be permanently deleted. This cannot be undone.`,
      },
      executor:      async (r, svc) => { await svc.delete(r.id); },
      bulkExecutor:  async (rs, svc) => { await svc.bulkDelete(rs.map(r => r.id)); },
    },
  ],
};
