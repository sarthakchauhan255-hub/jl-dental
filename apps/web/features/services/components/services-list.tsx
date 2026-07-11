"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable, type DataTableColumn } from "@/components/cms/data-table";
import { ConfirmDialog } from "@/components/cms/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

interface ServiceRow {
  id:         string;
  name:       string;
  slug:       string;
  shortDesc:  string;
  isActive:   boolean;
  isFeatured: boolean;
  order:      number;
}

export function ServicesList({ services, canManage }: { services: ServiceRow[]; canManage: boolean }) {
  const router   = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<ServiceRow | null>(null);
  const [deleting, setDeleting]         = useState(false);

  const columns: DataTableColumn<ServiceRow>[] = [
    {
      key: "name", header: "Service", sortable: true,
      cell: row => (
        <div>
          <p className="font-medium text-charcoal-900">{row.name}</p>
          <p className="text-xs text-charcoal-500 mt-0.5 line-clamp-1">{row.shortDesc}</p>
        </div>
      ),
    },
    {
      key: "status", header: "Status",
      cell: row => (
        <div className="flex items-center gap-1.5">
          <Badge variant={row.isActive ? "approved" : "rejected"}>
            {row.isActive ? "Active" : "Inactive"}
          </Badge>
          {row.isFeatured && <Badge variant="default">Featured</Badge>}
        </div>
      ),
    },
    {
      key: "slug", header: "Slug", hidden: true,
      cell: row => <span className="font-mono text-xs text-charcoal-400">{row.slug}</span>,
    },
    {
      key: "order", header: "Order", sortable: true,
      cell: row => <span className="text-sm text-charcoal-500">{row.order}</span>,
    },
  ];

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await fetch(`/api/services/${deleteTarget.id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  return (
    <>
      <DataTable
        data={services}
        columns={columns}
        searchable
        searchPlaceholder="Search services…"
        onRowClick={row => router.push(`/admin/services/${row.id}`)}
        rowActions={canManage ? row => (
          <div className="flex items-center justify-end gap-1">
            <Button variant="ghost" size="sm" asChild>
              <a href={`/admin/services/${row.id}`} onClick={e => e.stopPropagation()}>
                <Edit className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </Button>
            <Button
              variant="ghost" size="sm"
              onClick={e => { e.stopPropagation(); setDeleteTarget(row); }}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          </div>
        ) : undefined}
      />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={open => !open && setDeleteTarget(null)}
        title="Delete service"
        description={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
      />
    </>
  );
}
