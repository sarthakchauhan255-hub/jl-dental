"use client";
import { useState }     from "react";
import { useRouter }    from "next/navigation";
import { Badge }        from "@/components/ui/badge";
import { Button }       from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/cms/data-table";
import { ConfirmDialog } from "@/components/cms/confirm-dialog";
import { Pencil, Trash2 } from "lucide-react";

interface Doctor { id: string; name: string; slug: string; specialization: string; isActive: boolean; order: number }

export function DoctorListTable({ doctors, canEdit }: { doctors: Doctor[]; canEdit: boolean }) {
  const router = useRouter();
  const [deleting, setDeleting]   = useState<Doctor | null>(null);
  const [loading,  setLoading]    = useState(false);

  const columns: DataTableColumn<Doctor>[] = [
    { key: "name",           header: "Name",           sortable: true,  cell: d => <span className="font-medium text-charcoal-900">{d.name}</span> },
    { key: "specialization", header: "Specialization", sortable: true,  cell: d => d.specialization },
    { key: "order",          header: "Order",          sortable: true,  cell: d => d.order, hidden: true },
    { key: "status",         header: "Status",                          cell: d => <Badge variant={d.isActive ? "approved" : "rejected"}>{d.isActive ? "Active" : "Inactive"}</Badge> },
  ];

  async function handleDelete() {
    if (!deleting) return;
    setLoading(true);
    await fetch(`/api/doctors/${deleting.id}`, { method: "DELETE" });
    setLoading(false);
    setDeleting(null);
    router.refresh();
  }

  return (
    <>
      <DataTable
        data={doctors}
        columns={columns}
        searchable
        searchPlaceholder="Search doctors…"
        onRowClick={canEdit ? (d) => router.push(`/admin/doctors/${d.id}`) : undefined}
        rowActions={canEdit ? (d) => (
          <div className="flex items-center justify-end gap-1">
            <Button variant="ghost" size="sm" asChild>
              <a href={`/admin/doctors/${d.id}`} aria-label={`Edit ${d.name}`}>
                <Pencil className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setDeleting(d)} aria-label={`Delete ${d.name}`}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ) : undefined}
        emptyState={<p className="text-sm text-charcoal-400 text-center">No doctors yet. Add one to get started.</p>}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={() => setDeleting(null)}
        title="Delete doctor?"
        description={`"${deleting?.name}" will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        loading={loading}
        onConfirm={handleDelete}
      />
    </>
  );
}
