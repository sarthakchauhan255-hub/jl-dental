/**
 * DataTable placeholder — full implementation Phase 8.
 */
import { Skeleton } from "@/components/ui/skeleton";

interface DataTableProps {
  columns: unknown[];
  data:    unknown[];
  loading?: boolean;
}

export function DataTable({ loading = false }: DataTableProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
      Data table — Phase 8 implementation
    </div>
  );
}
