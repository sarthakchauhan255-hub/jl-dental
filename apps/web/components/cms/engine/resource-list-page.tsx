"use client";
/**
 * ResourceListPage — generic CMS list page shell.
 *
 * Business modules provide config + service + initial data.
 * This shell handles: search, pagination, table, empty state, permission-aware add button.
 */
import { useState, useCallback }    from "react";
import Link                         from "next/link";
import { Plus }                     from "lucide-react";
import { PageHeader }               from "@/components/cms/page-header";
import { PageContainer }            from "@/components/cms/page-container";
import { CmsBreadcrumb }            from "@/components/cms/breadcrumb";
import { Button }                   from "@/components/ui/button";
import { CmsTable }                 from "./table/cms-table";
import type { CmsRecord, CmsResourceConfig } from "@/lib/cms/types";
import type { CmsResourceService }  from "@/lib/cms/contracts";
import type { AuthUser }            from "@/types/auth";
import { canPerform }               from "@/lib/cms/permissions";

interface ResourceListPageProps<T extends CmsRecord> {
  config:       CmsResourceConfig<T>;
  service:      CmsResourceService<T>;
  initialData:  T[];
  initialTotal: number;
  user:         AuthUser | null;
  /** Extra content in the page header actions slot */
  headerActions?: React.ReactNode;
  /** Extra toolbar content (filter dropdowns etc.) */
  toolbarSlot?: React.ReactNode;
}

export function ResourceListPage<T extends CmsRecord>({
  config, service, initialData, initialTotal, user, headerActions, toolbarSlot,
}: ResourceListPageProps<T>) {
  const [data,    setData]    = useState<T[]>(initialData);
  const [total,   setTotal]   = useState(initialTotal);
  const [page,    setPage]    = useState(1);
  const [loading, setLoading] = useState(false);

  const canCreate = canPerform(user, config, "create");

  const refresh = useCallback(async (p = page) => {
    setLoading(true);
    try {
      const result = await service.findMany({ page: p, limit: 10 });
      setData(result.data);
      setTotal(result.pagination.total);
    } finally {
      setLoading(false);
    }
  }, [service, page]);

  const handlePageChange = useCallback((p: number) => {
    setPage(p);
    refresh(p);
  }, [refresh]);

  return (
    <PageContainer fluid>
      <PageHeader
        icon={config.meta.icon}
        title={config.meta.labelPlural}
        breadcrumb={
          <CmsBreadcrumb items={[
            { label: "Admin", href: "/admin/dashboard" },
            { label: config.meta.labelPlural },
          ]} />
        }
        actions={
          <div className="flex items-center gap-2">
            {headerActions}
            {canCreate && (
              <Button asChild size="sm">
                <Link href={`${config.routes.adminPath}/new`}>
                  <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
                  Add {config.meta.label}
                </Link>
              </Button>
            )}
          </div>
        }
      />

      <CmsTable
        data={data}
        total={total}
        page={page}
        loading={loading}
        config={config}
        service={service}
        user={user}
        onPageChange={handlePageChange}
        onRefresh={() => refresh()}
        toolbarSlot={toolbarSlot}
      />
    </PageContainer>
  );
}
