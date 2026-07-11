"use client";
import { useState }  from "react";
import { useRouter } from "next/navigation";
import { Badge }     from "@/components/ui/badge";
import { Button }    from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/cms/data-table";
import { ConfirmDialog }  from "@/components/cms/confirm-dialog";
import { Pencil, Trash2 } from "lucide-react";

interface Post { id: string; title: string; slug: string; status: string; category: string; publishedAt: Date | null }

const STATUS_VARIANTS: Record<string, "approved" | "rejected" | "pending"> = {
  published: "approved", draft: "pending", archived: "rejected",
};

export function BlogListTable({ posts, canEdit }: { posts: Post[]; canEdit: boolean }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<Post | null>(null);
  const [loading,  setLoading]  = useState(false);

  const columns: DataTableColumn<Post>[] = [
    { key: "title",    header: "Title",    sortable: true, cell: d => <span className="font-medium text-charcoal-900 line-clamp-1">{d.title}</span> },
    { key: "category", header: "Category",                cell: d => d.category },
    { key: "status",   header: "Status",                  cell: d => <Badge variant={STATUS_VARIANTS[d.status] ?? "pending"}>{d.status}</Badge> },
    { key: "date",     header: "Published", hidden: true, cell: d => d.publishedAt ? new Date(d.publishedAt).toLocaleDateString() : "—" },
  ];

  async function handleDelete() {
    if (!deleting) return;
    setLoading(true);
    await fetch(`/api/blog/${deleting.id}`, { method: "DELETE" });
    setLoading(false); setDeleting(null); router.refresh();
  }

  return (
    <>
      <DataTable
        data={posts} columns={columns} searchable searchPlaceholder="Search posts…"
        onRowClick={canEdit ? d => router.push(`/admin/blog/${d.id}`) : undefined}
        rowActions={canEdit ? d => (
          <div className="flex items-center justify-end gap-1">
            <Button variant="ghost" size="sm" asChild><a href={`/admin/blog/${d.id}`} aria-label={`Edit ${d.title}`}><Pencil className="h-4 w-4" /></a></Button>
            <Button variant="ghost" size="sm" onClick={() => setDeleting(d)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </div>
        ) : undefined}
        emptyState={<p className="text-sm text-charcoal-400 text-center">No posts yet. Create your first article.</p>}
      />
      <ConfirmDialog open={Boolean(deleting)} onOpenChange={() => setDeleting(null)}
        title="Delete post?" description={`"${deleting?.title}" will be permanently deleted.`}
        confirmLabel="Delete" destructive loading={loading} onConfirm={handleDelete} />
    </>
  );
}
