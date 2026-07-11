"use client";
import { useState }  from "react";
import { useRouter } from "next/navigation";
import { Badge }     from "@/components/ui/badge";
import { Button }    from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/cms/data-table";
import { ConfirmDialog } from "@/components/cms/confirm-dialog";
import { Trash2, Pencil } from "lucide-react";

interface FAQ { id: string; question: string; category: string; isActive: boolean; order: number }

export function FaqListTable({ faqs, canEdit }: { faqs: FAQ[]; canEdit: boolean }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<FAQ | null>(null);
  const [loading,  setLoading]  = useState(false);

  const columns: DataTableColumn<FAQ>[] = [
    { key: "question", header: "Question",  sortable: true, cell: d => <span className="font-medium text-charcoal-900 line-clamp-1 max-w-sm">{d.question}</span> },
    { key: "category", header: "Category",                 cell: d => d.category },
    { key: "status",   header: "Status",                   cell: d => <Badge variant={d.isActive ? "approved" : "rejected"}>{d.isActive ? "Active" : "Hidden"}</Badge> },
    { key: "order",    header: "Order",     sortable: true, cell: d => d.order, hidden: true },
  ];

  async function handleDelete() {
    if (!deleting) return;
    setLoading(true);
    await fetch(`/api/faq/${deleting.id}`, { method: "DELETE" });
    setLoading(false); setDeleting(null); router.refresh();
  }

  return (
    <>
      <DataTable data={faqs} columns={columns} searchable searchPlaceholder="Search FAQs…"
        onRowClick={canEdit ? d => router.push(`/admin/faq/${d.id}`) : undefined}
        rowActions={canEdit ? d => (
          <div className="flex items-center justify-end gap-1">
            <Button variant="ghost" size="sm" asChild><a href={`/admin/faq/${d.id}`} aria-label="Edit"><Pencil className="h-4 w-4" /></a></Button>
            <Button variant="ghost" size="sm" onClick={() => setDeleting(d)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </div>
        ) : undefined}
        emptyState={<p className="text-sm text-charcoal-400 text-center">No FAQs yet.</p>}
      />
      <ConfirmDialog open={Boolean(deleting)} onOpenChange={() => setDeleting(null)}
        title="Delete FAQ?" description="This question will be permanently removed."
        confirmLabel="Delete" destructive loading={loading} onConfirm={handleDelete} />
    </>
  );
}
