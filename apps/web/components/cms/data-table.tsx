"use client";
/**
 * DataTable — the single standardized table component for all CMS modules.
 * No module creates its own table. All list views use this.
 *
 * Features: sorting, search, pagination, bulk selection, status badges,
 * column visibility, responsive behavior, empty states.
 */
import { useState, useMemo, type ReactNode } from "react";
import { ChevronUp, ChevronDown, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { cn }         from "@/lib/utils";
import { Input }      from "@/components/ui/input";
import { Button }     from "@/components/ui/button";
import { Skeleton }   from "@/components/ui/skeleton";
import { Badge }      from "@/components/ui/badge";

export interface DataTableColumn<T> {
  key:        string;
  header:     string;
  sortable?:  boolean;
  hidden?:    boolean;    // responsive — hide on small screens
  cell:       (row: T) => ReactNode;
}

export interface DataTableAction<T> {
  label:       string;
  onClick:     (rows: T[]) => void;
  destructive?: boolean;
  disabled?:   (rows: T[]) => boolean;
}

interface DataTableProps<T extends { id: string }> {
  data:         T[];
  columns:      DataTableColumn<T>[];
  loading?:     boolean;
  searchable?:  boolean;
  searchPlaceholder?: string;
  bulkActions?: DataTableAction<T>[];
  pagination?:  {
    page:       number;
    pageSize:   number;
    total:      number;
    onPageChange: (page: number) => void;
  };
  onSort?:      (key: string, dir: "asc" | "desc") => void;
  emptyState?:  ReactNode;
  rowActions?:  (row: T) => ReactNode;
  onRowClick?:  (row: T) => void;
}

type SortDir = "asc" | "desc" | null;

export function DataTable<T extends { id: string }>({
  data, columns, loading, searchable, searchPlaceholder = "Search…",
  bulkActions, pagination, onSort, emptyState, rowActions, onRowClick,
}: DataTableProps<T>) {
  const [search,    setSearch]    = useState("");
  const [sortKey,   setSortKey]   = useState<string | null>(null);
  const [sortDir,   setSortDir]   = useState<SortDir>(null);
  const [selected,  setSelected]  = useState<Set<string>>(new Set());

  const visibleCols = columns.filter(c => !c.hidden);

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter(row =>
      columns.some(col => {
        const cell = col.cell(row);
        return typeof cell === "string" && cell.toLowerCase().includes(q);
      })
    );
  }, [data, search, columns]);

  function handleSort(key: string) {
    if (!onSort) return;
    const newDir: SortDir = sortKey === key
      ? sortDir === "asc" ? "desc" : sortDir === "desc" ? null : "asc"
      : "asc";
    setSortKey(newDir ? key : null);
    setSortDir(newDir);
    if (newDir) onSort(key, newDir);
  }

  const allSelected = filtered.length > 0 && filtered.every(r => selected.has(r.id));
  function toggleAll() {
    setSelected(allSelected
      ? new Set()
      : new Set(filtered.map(r => r.id))
    );
  }
  function toggleRow(id: string) {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  }

  const selectedRows = filtered.filter(r => selected.has(r.id));
  const hasSelected  = selectedRows.length > 0;
  const totalPages   = pagination ? Math.ceil(pagination.total / pagination.pageSize) : 1;

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        {searchable && (
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" aria-hidden="true" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-9"
              aria-label="Search table"
            />
          </div>
        )}
        {hasSelected && bulkActions && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-charcoal-500">{selectedRows.length} selected</span>
            {bulkActions.map((action, i) => (
              <Button
                key={i}
                size="sm"
                variant={action.destructive ? "destructive" : "secondary"}
                onClick={() => action.onClick(selectedRows)}
                disabled={action.disabled?.(selectedRows)}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" role="grid">
            <thead className="bg-charcoal-50 border-b border-border">
              <tr>
                {bulkActions && (
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      aria-label="Select all rows"
                      className="rounded border-charcoal-300 text-primary-700 focus:ring-primary-400"
                    />
                  </th>
                )}
                {visibleCols.map(col => (
                  <th
                    key={col.key}
                    className={cn(
                      "px-4 py-3 text-left text-xs font-medium text-charcoal-500 uppercase tracking-wider whitespace-nowrap",
                      col.sortable && onSort && "cursor-pointer select-none hover:text-charcoal-700"
                    )}
                    onClick={() => col.sortable && handleSort(col.key)}
                    aria-sort={sortKey === col.key
                      ? sortDir === "asc" ? "ascending" : "descending"
                      : undefined}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.header}
                      {col.sortable && onSort && (
                        <span className="inline-flex flex-col" aria-hidden="true">
                          <ChevronUp   className={cn("h-2.5 w-2.5 -mb-0.5", sortKey === col.key && sortDir === "asc"  ? "text-primary-700" : "text-charcoal-300")} />
                          <ChevronDown className={cn("h-2.5 w-2.5",          sortKey === col.key && sortDir === "desc" ? "text-primary-700" : "text-charcoal-300")} />
                        </span>
                      )}
                    </span>
                  </th>
                ))}
                {rowActions && <th className="px-4 py-3 text-right text-xs font-medium text-charcoal-500 uppercase tracking-wider">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {bulkActions && <td className="px-4 py-3"><Skeleton className="h-4 w-4 rounded" /></td>}
                      {visibleCols.map(col => (
                        <td key={col.key} className="px-4 py-3">
                          <Skeleton className="h-4 w-24 rounded" />
                        </td>
                      ))}
                      {rowActions && <td className="px-4 py-3"><Skeleton className="h-4 w-16 rounded ml-auto" /></td>}
                    </tr>
                  ))
                : filtered.length === 0
                  ? (
                    <tr>
                      <td colSpan={visibleCols.length + (bulkActions ? 1 : 0) + (rowActions ? 1 : 0)} className="py-12">
                        {emptyState ?? (
                          <div className="text-center text-sm text-charcoal-400">No items found</div>
                        )}
                      </td>
                    </tr>
                  )
                  : filtered.map(row => (
                    <tr
                      key={row.id}
                      className={cn(
                        "hover:bg-charcoal-50/50 transition-colors",
                        onRowClick && "cursor-pointer",
                        selected.has(row.id) && "bg-primary-50/40"
                      )}
                      onClick={() => onRowClick?.(row)}
                    >
                      {bulkActions && (
                        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selected.has(row.id)}
                            onChange={() => toggleRow(row.id)}
                            aria-label={`Select row ${row.id}`}
                            className="rounded border-charcoal-300 text-primary-700 focus:ring-primary-400"
                          />
                        </td>
                      )}
                      {visibleCols.map(col => (
                        <td key={col.key} className="px-4 py-3 text-charcoal-700">
                          {col.cell(row)}
                        </td>
                      ))}
                      {rowActions && (
                        <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                          {rowActions(row)}
                        </td>
                      )}
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-xs text-charcoal-500">
              Page {pagination.page} of {totalPages} ({pagination.total} total)
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.page + 1)}
                disabled={pagination.page >= totalPages}
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
