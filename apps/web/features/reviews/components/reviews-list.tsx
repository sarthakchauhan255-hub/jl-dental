"use client";
import { useRouter }     from "next/navigation";
import { DataTable, type DataTableColumn } from "@/components/cms/data-table";
import { Badge }   from "@/components/ui/badge";
import { Button }  from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface ReviewRow { id: string; patientName: string; rating: number; comment: string; status: string; createdAt: string; }

export function ReviewsList({ reviews, canModerate }: { reviews: ReviewRow[]; canModerate: boolean }) {
  const router = useRouter();

  async function moderate(id: string, status: "approved" | "rejected") {
    await fetch(`/api/reviews/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    router.refresh();
  }

  const statusVariant = (s: string) => s === "approved" ? "approved" : s === "rejected" ? "rejected" : "default";

  const columns: DataTableColumn<ReviewRow>[] = [
    {
      key: "patient", header: "Patient",
      cell: row => (
        <div>
          <p className="font-medium text-charcoal-900">{row.patientName}</p>
          <p className="text-xs text-charcoal-500">{"★".repeat(row.rating)}{"☆".repeat(5 - row.rating)}</p>
        </div>
      ),
    },
    { key: "comment", header: "Comment", cell: row => <p className="text-sm text-charcoal-700 line-clamp-2 max-w-xs">{row.comment}</p> },
    { key: "status", header: "Status", cell: row => <Badge variant={statusVariant(row.status) as "approved" | "rejected" | "default"}>{row.status}</Badge> },
    {
      key: "date", header: "Date", hidden: true,
      cell: row => <span className="text-xs text-charcoal-400">{new Date(row.createdAt).toLocaleDateString()}</span>,
    },
  ];

  return (
    <DataTable data={reviews} columns={columns} searchable searchPlaceholder="Search reviews…"
      rowActions={canModerate ? row => (
        <div className="flex items-center justify-end gap-1">
          {row.status !== "approved" && (
            <Button variant="ghost" size="sm" onClick={() => moderate(row.id, "approved")} className="text-green-600 hover:text-green-700">
              <Check className="h-3.5 w-3.5" />
            </Button>
          )}
          {row.status !== "rejected" && (
            <Button variant="ghost" size="sm" onClick={() => moderate(row.id, "rejected")} className="text-destructive hover:text-destructive">
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      ) : undefined}
    />
  );
}
