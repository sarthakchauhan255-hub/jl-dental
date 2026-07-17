"use client";
/**
 * CmsTable — resource-agnostic CMS table engine.
 *
 * ARCHITECTURAL INVARIANTS (enforced by code, not just comments):
 *  • No switch/case on action.id — no semantic meaning attached to any ID string.
 *  • No implicit mutation for any action — including "delete".
 *  • Every mutation goes through action.executor (row) or action.bulkExecutor (bulk).
 *  • If an action has no executor, the engine throws a configuration error.
 *    This surfaces resource misconfiguration at development time, not silently.
 *  • Permissions are checked for UI visibility only. Server enforces independently.
 *  • No knowledge of "isActive", "status", "deletedAt" or any resource field.
 *
 * UNIFORM EXECUTION CONTRACT:
 *   triggerAction → confirm if needed → executeViaExecutor → refresh
 *   triggerBulkAction → confirm if needed → executeViaBulkExecutor → refresh
 */
import { useState, useCallback }              from "react";
import { useRouter }                          from "next/navigation";
import { DataTable }                          from "@/components/cms/data-table";
import { ConfirmDialog }                      from "@/components/cms/confirm-dialog";
import { Button }                             from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal }                     from "lucide-react";
import type { CmsRecord, CmsResourceConfig, CmsActionDefinition } from "@/lib/cms/types";
import type { CmsResourceService }            from "@/lib/cms/contracts";
import type { AuthUser }                      from "@/types/auth";
import { canPerform }                         from "@/lib/cms/permissions";

// ─── Uniform action execution ─────────────────────────────────────────────────
// ONE code path for ALL actions. No special cases, no hardcoded IDs.
async function executeViaExecutor<T extends CmsRecord>(
  action:  CmsActionDefinition<T>,
  record:  T,
  service: CmsResourceService<T>,
): Promise<void> {
  if (!action.executor) {
    throw new Error(
      `[CmsTable] Action "${action.id}" has no executor defined. ` +
      `All mutating actions must provide an executor in the resource config. ` +
      `Use the createDeleteAction(), createSoftDeleteAction() factory helpers or define your own.`
    );
  }
  await action.executor(record, service);
}

async function executeViaBulkExecutor<T extends CmsRecord>(
  action:  CmsActionDefinition<T>,
  records: T[],
  service: CmsResourceService<T>,
): Promise<void> {
  if (action.bulkExecutor) {
    await action.bulkExecutor(records, service);
    return;
  }
  // When only a row executor is provided, run it per record for bulk operations.
  // Resources may provide bulkExecutor for efficiency (e.g. batch API call).
  await Promise.all(records.map(r => executeViaExecutor(action, r, service)));
}

// ─── Dialog state ─────────────────────────────────────────────────────────────
interface PendingAction {
  action:   CmsActionDefinition<CmsRecord>;
  record?:  CmsRecord;
  records?: CmsRecord[];
}

// ─── Component ───────────────────────────────────────────────────────────────
interface CmsTableProps<T extends CmsRecord> {
  data:         T[];
  total:        number;
  page:         number;
  pageSize?:    number;
  loading?:     boolean;
  config:       CmsResourceConfig<T>;
  service:      CmsResourceService<T>;
  user:         AuthUser | null;
  onPageChange: (page: number) => void;
  onRefresh?:   () => void;
  /** Hide the empty-state Add button (resource has no /new page). */
  allowCreate?: boolean;
  toolbarSlot?: React.ReactNode;
}

export function CmsTable<T extends CmsRecord>({
  data, total, page, pageSize = 10, loading,
  config, service, user,
  onPageChange, onRefresh, toolbarSlot, allowCreate = true,
}: CmsTableProps<T>) {
  const router  = useRouter();
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [opBusy, setOpBusy]  = useState(false);

  const rowActions  = (config.actions ?? []).filter(a => a.scope.includes("row"));
  const bulkActions = (config.actions ?? []).filter(a => a.scope.includes("bulk"));

  // ─── Action trigger ────────────────────────────────────────────────────────
  function triggerRowAction(action: CmsActionDefinition<T>, record: T): void {
    if (action.confirm) {
      setPending({
        action: action as unknown as CmsActionDefinition<CmsRecord>,
        record: record as unknown as CmsRecord,
      });
    } else {
      void executeViaExecutor(action, record, service)
        .then(() => { onRefresh?.(); router.refresh(); })
        .catch(console.error);
    }
  }

  function triggerBulkAction(action: CmsActionDefinition<T>, records: T[]): void {
    if (action.confirm) {
      setPending({
        action:  action as unknown as CmsActionDefinition<CmsRecord>,
        records: records as unknown as CmsRecord[],
      });
    } else {
      void executeViaBulkExecutor(action, records, service)
        .then(() => { onRefresh?.(); router.refresh(); })
        .catch(console.error);
    }
  }

  // ─── Confirmation execution ────────────────────────────────────────────────
  const executeConfirmed = useCallback(async () => {
    if (!pending) return;
    setOpBusy(true);
    try {
      // Bridge generics: the pending action was stored as CmsRecord-typed at dialog time.
      // Execute via the same uniform contract as direct triggers.
      const svc = service as unknown as CmsResourceService<CmsRecord>;
      const act = pending.action as unknown as CmsActionDefinition<CmsRecord>;

      if (pending.records) {
        await executeViaBulkExecutor(act, pending.records, svc);
      } else if (pending.record) {
        await executeViaExecutor(act, pending.record, svc);
      }
      onRefresh?.();
      router.refresh();
    } catch (err) {
      console.error("[CmsTable] Action execution failed:", err);
    } finally {
      setOpBusy(false);
      setPending(null);
    }
  }, [pending, service, onRefresh, router]);

  // ─── Permission check for visibility ──────────────────────────────────────
  function isActionVisible(action: CmsActionDefinition<T>, record: T): boolean {
    if (!canPerform(user, config, "update")) return false;
    if (action.isAvailable && !action.isAvailable(record)) return false;
    return true;
  }

  // ─── Row action menu ───────────────────────────────────────────────────────
  const renderRowActions = (record: T): React.ReactNode => {
    const available = rowActions.filter(a => isActionVisible(a, record));
    if (available.length === 0) return null;

    const safe        = available.filter(a => !a.destructive);
    const destructive = available.filter(a => a.destructive);

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" aria-label="Row actions">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          {safe.map(action => {
            const Icon    = action.icon;
            const enabled = action.isEnabled ? action.isEnabled(record) : true;
            return (
              <DropdownMenuItem
                key={action.id}
                disabled={!enabled}
                className="cursor-pointer"
                onClick={() => triggerRowAction(action, record)}
              >
                {Icon && <Icon className="mr-2 h-4 w-4" aria-hidden="true" />}
                {action.label}
              </DropdownMenuItem>
            );
          })}
          {safe.length > 0 && destructive.length > 0 && <DropdownMenuSeparator />}
          {destructive.map(action => {
            const Icon    = action.icon;
            const enabled = action.isEnabled ? action.isEnabled(record) : true;
            return (
              <DropdownMenuItem
                key={action.id}
                destructive
                disabled={!enabled}
                className="cursor-pointer"
                onClick={() => triggerRowAction(action, record)}
              >
                {Icon && <Icon className="mr-2 h-4 w-4" aria-hidden="true" />}
                {action.label}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  // ─── Bulk action config ────────────────────────────────────────────────────
  const bulkActionConfig = bulkActions.map(action => ({
    label:       action.label,
    destructive: action.destructive,
    onClick:     (rows: T[]) => triggerBulkAction(action, rows),
    disabled:    (_rows: T[]) => false,
  }));

  const pendingRecord  = pending?.record as T | undefined;
  const pendingRecords = pending?.records as T[] | undefined;

  return (
    <>
      {toolbarSlot && <div className="mb-3">{toolbarSlot}</div>}

      <DataTable
        data={data}
        columns={config.table.columns}
        loading={loading}
        searchable={Boolean(config.table.search)}
        searchPlaceholder={config.table.search?.placeholder}
        bulkActions={bulkActionConfig.length > 0 ? bulkActionConfig : undefined}
        rowActions={rowActions.length > 0 ? renderRowActions : undefined}
        onRowClick={canPerform(user, config, "update") ? r => router.push(`${config.routes.adminPath}/${r.id}`) : undefined}
        pagination={{ page, pageSize, total, onPageChange }}
        emptyState={
          <div className="py-12 text-center">
            <p className="text-sm font-medium text-charcoal-600">
              No {config.meta.labelPlural.toLowerCase()} yet
            </p>
            {allowCreate && canPerform(user, config, "create") && (
              <Button size="sm" className="mt-3" onClick={() => router.push(`${config.routes.adminPath}/new`)}>
                Add {config.meta.label}
              </Button>
            )}
          </div>
        }
      />

      {pending && (
        <ConfirmDialog
          open
          onOpenChange={() => setPending(null)}
          title={pending.action.confirm?.title ?? "Confirm action"}
          description={
            pendingRecord
              ? (pending.action.confirm?.description(pendingRecord) ?? "Are you sure?")
              : pendingRecords
                ? `${pendingRecords.length} items will be affected.`
                : "Are you sure?"
          }
          confirmLabel="Confirm"
          destructive={pending.action.destructive}
          loading={opBusy}
          onConfirm={executeConfirmed}
        />
      )}
    </>
  );
}
