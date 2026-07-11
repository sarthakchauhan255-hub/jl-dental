import { HelpCircle, Eye, EyeOff, Trash2 } from "lucide-react";
import { ResourceStatusBadge } from "@/components/cms/engine";
import { buildCacheConfig }    from "@/lib/cms/cache";
import { CACHE_TAGS }          from "@/lib/cache";
import type { CmsResourceConfig } from "@/lib/cms/types";
import type { FaqRecord }      from "../service/faq.service";

export const FAQ_CACHE = buildCacheConfig(CACHE_TAGS.faq, true);

export const faqConfig: CmsResourceConfig<FaqRecord> = {
  meta:    { label: "FAQ", labelPlural: "FAQs", icon: HelpCircle },
  routes:  { apiPath: "/api/faq", adminPath: "/admin/faq" },
  permissions: { read: "faq.read", create: "faq.create", update: "faq.update", delete: "faq.delete" },
  cache:   FAQ_CACHE,
  audit:   { resourceName: "faq" },
  table: {
    displayField: "question",
    search: { placeholder: "Search FAQs…", fields: ["question","answer"] },
    columns: [
      { key: "question", header: "Question", sortable: true, cell: r => r.question },
      { key: "category", header: "Category",               cell: r => r.category },
      { key: "status",   header: "Status",                 cell: r => <ResourceStatusBadge active={r.isActive} /> },
      { key: "order",    header: "Order",   sortable: true, responsive: true, cell: r => r.order },
    ],
  },
  actions: [
    { id: "activate",   label: "Activate",   icon: Eye,    scope: ["row"], permission: "faq.update", isAvailable: r => !r.isActive,  executor: async (r,s) => { await s.update(r.id, {isActive:true});  } },
    { id: "deactivate", label: "Deactivate", icon: EyeOff, scope: ["row"], permission: "faq.update", isAvailable: r => r.isActive,   executor: async (r,s) => { await s.update(r.id, {isActive:false}); } },
    { id: "delete", label: "Delete", icon: Trash2, scope: ["row","bulk"], permission: "faq.delete", destructive: true,
      confirm: { title: "Delete FAQ?", description: r => `This question will be permanently removed.` },
      executor: async (r,s) => { await s.delete(r.id); },
      bulkExecutor: async (rs,s) => { await s.bulkDelete(rs.map(r=>r.id)); },
    },
  ],
};
