"use client";
/**
 * ResourceEditPage — generic CMS edit page shell.
 *
 * Business modules provide: config, service, schema, initial data, field sections.
 * Shell handles: dirty state, save, server errors, success feedback.
 */
import { useState, useCallback }       from "react";
import { useRouter }                   from "next/navigation";
import type { ZodSchema }              from "zod";
import { PageHeader }                  from "@/components/cms/page-header";
import { PageContainer }               from "@/components/cms/page-container";
import { CmsBreadcrumb }               from "@/components/cms/breadcrumb";
import { CmsForm, type CmsFormSaveState } from "./form/cms-form";
import { parseCmsError, type CmsError } from "@/lib/cms/errors";
import type { CmsRecord, CmsResourceConfig } from "@/lib/cms/types";
import type { CmsResourceService }     from "@/lib/cms/contracts";
import type { FormHandle } from "./form/cms-form";

interface ResourceEditPageProps<T extends CmsRecord, Input extends Record<string, unknown>> {
  config:       CmsResourceConfig<T>;
  service:      CmsResourceService<T, Input>;
  // Accepts both full and partial schemas (create vs update)
  schema:       ZodSchema<Input> | ZodSchema<Partial<Input>>;
  record:       T;
  defaultValues: Partial<Input>;
  children:     (handle: FormHandle<Input>) => React.ReactNode;
  /** Extra content in header (e.g. preview link, status toggle) */
  headerActions?: React.ReactNode;
}

export function ResourceEditPage<T extends CmsRecord, Input extends Record<string, unknown>>({
  config, service, schema, record, defaultValues, children, headerActions,
}: ResourceEditPageProps<T, Input>) {
  const router = useRouter();
  const [saveState,   setSaveState]   = useState<CmsFormSaveState>("idle");
  const [serverError, setServerError] = useState<CmsError | null>(null);

  const handleSubmit = useCallback(async (data: Input): Promise<CmsError | null> => {
    setSaveState("saving");
    setServerError(null);
    const result = await service.update(record.id, data);
    if (!result.success) {
      const error = parseCmsError(result as { success: false; error: string; code?: string; fields?: Record<string,string> });
      setServerError(error);
      setSaveState("error");
      return error;
    }
    setSaveState("saved");
    setTimeout(() => setSaveState("idle"), 3000);
    return null;
  }, [service, record]);

  const displayName = String(record[config.table.displayField]) || config.meta.label;

  return (
    <PageContainer>
      <PageHeader
        icon={config.meta.icon}
        title={displayName}
        breadcrumb={
          <CmsBreadcrumb items={[
            { label: "Admin", href: "/admin/dashboard" },
            { label: config.meta.labelPlural, href: config.routes.adminPath },
            { label: displayName },
          ]} />
        }
        actions={headerActions}
      />

      <CmsForm
        defaultValues={defaultValues as unknown as import('react-hook-form').DefaultValues<Input>}
        schema={schema as ZodSchema<Input>}
        onSubmit={handleSubmit}
        onCancel={() => router.push(config.routes.adminPath)}
        submitLabel="Save Changes"
        saveState={saveState}
        serverError={serverError}
        resourceLabel={config.meta.label.toLowerCase()}
      >
        {children}
      </CmsForm>
    </PageContainer>
  );
}
