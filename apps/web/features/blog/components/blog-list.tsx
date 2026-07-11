"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable, type DataTableColumn } from "@/components/cms/data-table";
import { ConfirmDialog } from "@/components/cms/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

interface PostRow { id: string; title: string; slug: string; status: string; author: string; category: string; publishedAt: string | null; }

export function BlogList({ posts, canManage }: { posts: PostRow[]; canManage: boolean }) {
  const router = useRouter();
  const [del, setDel] = useState<PostRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const statusVariant = (s: string) => s === "published" ? "approved" : s === "archived" ? "rejected" : "default";

  const columns: DataTableColumn<PostRow>[] = [
    {
      key: "title", header: "Title", sortable: true,
      cell: row => (
        <div>
          <p className="font-medium text-charcoal-900 line-clamp-1">{row.title}</p>
          <p className="text-xs text-charcoal-500 mt-0.5">{row.category} · {row.author}</p>
        </div>
      ),
    },
    { key: "status", header: "Status", cell: row => <Badge variant={statusVariant(row.status) as "approved" | "rejected" | "default"}>{row.status}</Badge> },
    { key: "publishedAt", header: "Published", hidden: true, cell: row => <span className="text-xs text-charcoal-500">{row.publishedAt ? new Date(row.publishedAt).toLocaleDateString() : "—"}</span> },
  ];

  async function doDelete() {
    if (!del) return;
    setDeleting(true);
    await fetch(`/api/blog/${del.id}`, { method: "DELETE" });
    setDeleting(false); setDel(null); router.refresh();
  }

  return (
    <>
      <DataTable data={posts} columns={columns} searchable searchPlaceholder="Search posts…"
        onRowClick={row => router.push(`/admin/blog/${row.id}`)}
        rowActions={canManage ? row => (
          <div className="flex items-center justify-end gap-1">
            <Button variant="ghost" size="sm" asChild>
              <a href={`/admin/blog/${row.id}`} onClick={e => e.stopPropagation()}><Edit className="h-3.5 w-3.5" /></a>
            </Button>
            <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setDel(row); }} className="text-destructive hover:text-destructive">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : undefined}
      />
      <ConfirmDialog open={Boolean(del)} onOpenChange={o => !o && setDel(null)}
        title="Delete post" description={`Delete "${del?.title}"? This cannot be undone.`}
        confirmLabel="Delete" destructive loading={deleting} onConfirm={doDelete} />
    </>
  );
}
