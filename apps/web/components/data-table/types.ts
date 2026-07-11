/**
 * Data table type definitions — pre-established for Phase 8.
 */

export interface ColumnDef<TData> {
  id:        string;
  header:    string;
  accessorKey?: keyof TData;
  cell?:     (value: TData) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

export function createColumnHelper<TData>() {
  return {
    display: (def: ColumnDef<TData>) => def,
    accessor: (key: keyof TData, def: Omit<ColumnDef<TData>, "id" | "accessorKey">) => ({
      id: String(key),
      accessorKey: key,
      ...def,
    }),
  };
}
