"use client";
import { useState }  from "react";
import { useRouter } from "next/navigation";
import { Badge }     from "@/components/ui/badge";
import { Button }    from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/cms/data-table";
import { Check, X, Star } from "lucide-react";

interface Review { id: string; patientName: string; rating: number; comment: string; status: string; isFeatured: boolean }

const STATUS_VARIANTS: Record<string, "approved" | "rejected" | "pending"> = {
  approved: "approved", rejected: "rejected", pending: "pending",
};

export function ReviewListTable({ reviews }: { reviews: Review[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function updateStatus(id: string, status: "approved" | "rejected") {
    setLoading(id);
    await fetch(`/api/reviews?id=${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoading(null);
    router.refresh();
  }

  const columns: DataTableColumn<Review>[] = [
    { key: "patient", header: "Patient",  cell: d => <span className="font-medium text-charcoal-900">{d.patientName}</span> },
    { key: "rating",  header: "Rating",   cell: d => (
      <span className="flex items-center gap-0.5">
        <Star className="h-3.5 w-3.5 fill-accent-gold text-accent-gold" aria-hidden="true" />
        <span className="text-sm">{d.rating}/5</span>
      </span>
    )},
    { key: "comment", header: "Comment",  cell: d => <span className="line-clamp-1 max-w-xs text-charcoal-600 text-sm">{d.comment}</span> },
    { key: "status",  header: "Status",   cell: d => <Badge variant={STATUS_VARIANTS[d.status] ?? "pending"}>{d.status}</Badge> },
    { key: "featured",header: "Featured", hidden: true, cell: d => d.isFeatured ? <Badge variant="approved">Featured</Badge> : null },
  ];

  return (
    <DataTable
      data={reviews} columns={columns} searchable searchPlaceholder="Search reviews…"
      rowActions={d => (
        d.status === "pending" ? (
          <div className="flex items-center justify-end gap-1">
            <Button variant="ghost" size="sm" onClick={() => updateStatus(d.id, "approved")} disabled={loading === d.id} aria-label="Approve">
              <Check className="h-4 w-4 text-green-600" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => updateStatus(d.id, "rejected")} disabled={loading === d.id} aria-label="Reject">
              <X className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ) : null
      )}
      emptyState={<p className="text-sm text-charcoal-400 text-center">No reviews found.</p>}
    />
  );
}
