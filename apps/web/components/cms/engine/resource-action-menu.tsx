"use client";
/**
 * ResourceActionMenu — renders page/detail-scope action menus.
 *
 * ARCHITECTURE:
 *  • No branching on action.id for permission or mutation semantics.
 *  • Permission visibility uses action.permission directly via hasPermission().
 *  • Execution calls action.executor() — no implicit dispatch.
 *  • Client-side checks control visibility only; server enforces independently.
 */
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button }                     from "@/components/ui/button";
import { MoreHorizontal }             from "lucide-react";
import { hasPermission }              from "@/lib/auth/rbac";
import type { CmsActionDefinition, CmsRecord } from "@/lib/cms/types";
import type { CmsResourceService }    from "@/lib/cms/contracts";
import type { AuthUser }              from "@/types/auth";

interface ResourceActionMenuProps<T extends CmsRecord> {
  record:  T;
  actions: CmsActionDefinition<T>[];
  user:    AuthUser | null;
  service: CmsResourceService<T>;
  onDone?: () => void;
}

export function ResourceActionMenu<T extends CmsRecord>({
  record, actions, user, service, onDone,
}: ResourceActionMenuProps<T>) {
  // Filter to available actions — no branching on action.id
  const available = actions.filter(action => {
    // Permission visibility: check action.permission if declared.
    // No action.id-based permission mapping — resources declare what they need.
    if (action.permission && user && !hasPermission(user.role, action.permission)) return false;
    if (!user) return false;
    return action.isAvailable ? action.isAvailable(record) : true;
  });

  if (available.length === 0) return null;

  const safe        = available.filter(a => !a.destructive);
  const destructive = available.filter(a => a.destructive);

  async function handleAction(action: CmsActionDefinition<T>) {
    if (!action.executor) {
      console.warn(`[ResourceActionMenu] Action "${action.id}" has no executor — skipped.`);
      return;
    }
    await action.executor(record, service);
    onDone?.();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" aria-label="Actions">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {safe.map(action => {
          const Icon    = action.icon;
          const enabled = action.isEnabled ? action.isEnabled(record) : true;
          return (
            <DropdownMenuItem
              key={action.id}
              disabled={!enabled}
              className="cursor-pointer"
              onClick={() => void handleAction(action)}
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
              onClick={() => void handleAction(action)}
            >
              {Icon && <Icon className="mr-2 h-4 w-4" aria-hidden="true" />}
              {action.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
