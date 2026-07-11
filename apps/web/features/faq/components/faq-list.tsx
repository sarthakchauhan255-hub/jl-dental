"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable, type DataTableColumn } from "@/components/cms/data-table";
import { ConfirmDialog } from "@/components/cms/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

interface FaqRow { id: string; question: string; category: string; isActive: boolean; order: number; }

export function FaqList({ faqs, canManage }: { faqs: FaqRow[]; canManage: boolean }) {
  const router = useRouter();
  const [del, setDel] = useState<FaqRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const columns: DataTableColumn<FaqRow>[] = [
    {
      key: "question", header: "Question", sortable: true,
      cell: row => (
        <div>
          <p className="font-medium text-charcoal-900 line-clamp-1">{row.question}</p>
          <p className="text-xs text-charcoal-500 mt-0.5">{row.category}</p>
        </div>
      ),
    },
    { key: "status", header: "Status", cell: row => <Badge variant={row.isActive ? "approved" : "rejected"}>{row.isActive ? "Active" : "Inactive"}</Badge> },
    { key: "order", header: "Order", sortable: true, cell: row => <span className="text-xs text-charcoal-500">{row.order}</span> },
  ];

  async function doDelete() {
    if (!del) return;
    setDeleting(true);
    await fetch(`/api/faq/${del.id}`, { method: "DELETE" });
    setDeleting(false); setDel(null); router.refresh();
  }

  return (
    <>
      <DataTable data={faqs} columns={columns} searchable searchPlaceholder="Search FAQs…"
        onRowClick={row => router.push(`/admin/faq/${row.id}`)}
        rowActions={canManage ? row => (
          <div className="flex items-center justify-end gap-1">
            <Button variant="ghost" size="sm" asChild>
              <a href={`/admin/faq/${row.id}`} onClick={e => e.stopPropagation()}><Edit className="h-3.5 w-3.5" /></a>
            </Button>
            <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setDel(row); }} className="text-destructive hover:text-destructive">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : undefined}
      />
      <ConfirmDialog open={Boolean(del)} onOpenChange={o => !o && setDel(null)}
        title="Delete FAQ" description={`Delete this FAQ? This cannot be undone.`}
        confirmLabel="Delete" destructive loading={deleting} onConfirm={doDelete} />
    </>
  );
}
