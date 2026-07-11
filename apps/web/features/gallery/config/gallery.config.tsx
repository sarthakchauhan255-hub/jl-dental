import { Images, Eye, EyeOff, Trash2 } from "lucide-react";
import { Badge }                        from "@/components/ui/badge";
import { ResourceStatusBadge }          from "@/components/cms/engine";
import { buildCacheConfig }             from "@/lib/cms/cache";
import { CACHE_TAGS }                   from "@/lib/cache";
import type { CmsResourceConfig }       from "@/lib/cms/types";
import type { GalleryRecord }           from "../service/gallery.service";

export const GALLERY_CACHE = buildCacheConfig(CACHE_TAGS.gallery, true);

export const galleryConfig: CmsResourceConfig<GalleryRecord> = {
  meta:    { label: "Gallery Item", labelPlural: "Gallery", icon: Images },
  routes:  { apiPath: "/api/gallery", adminPath: "/admin/gallery" },
  permissions: { read: "gallery.read", create: "gallery.create", update: "gallery.update", delete: "gallery.delete" },
  cache:   GALLERY_CACHE,
  audit:   { resourceName: "gallery_item", excludeFromDiff: ["before","after","image"] },
  table: {
    displayField: "caption",
    search: { placeholder: "Search gallery…", fields: ["caption","category"] },
    filters: [
      { key: "type", label: "Type", type: "select",
        options: [{ label:"Before/After", value:"before_after" }, { label:"General", value:"general" }] },
    ],
    columns: [
      { key: "caption",  header: "Caption",  cell: r => r.caption || r.category },
      { key: "type",     header: "Type",     cell: r => <Badge variant={r.type==="before_after"?"approved":"pending"}>{r.type==="before_after"?"Before/After":"General"}</Badge> },
      { key: "category", header: "Category", cell: r => r.category, responsive: true },
      { key: "status",   header: "Status",   cell: r => <ResourceStatusBadge active={r.isActive} /> },
    ],
  },
  actions: [
    { id: "activate",   label: "Show",  icon: Eye,    scope: ["row"], permission: "gallery.update", isAvailable: r => !r.isActive,  executor: async (r,s) => { await s.update(r.id, {isActive:true});  } },
    { id: "deactivate", label: "Hide",  icon: EyeOff, scope: ["row"], permission: "gallery.update", isAvailable: r => r.isActive,   executor: async (r,s) => { await s.update(r.id, {isActive:false}); } },
    { id: "delete", label: "Delete", icon: Trash2, scope: ["row","bulk"], permission: "gallery.delete", destructive: true,
      confirm: { title: "Delete image?", description: () => "This image will be permanently deleted." },
      executor: async (r,s) => { await s.delete(r.id); },
      bulkExecutor: async (rs,s) => { await s.bulkDelete(rs.map(r=>r.id)); },
    },
  ],
};
