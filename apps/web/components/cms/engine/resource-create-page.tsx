"use client";
/**
 * ResourceCreatePage — generic CMS create page shell.
 *
 * Business modules provide: config, service, schema, field sections.
 * This shell handles: permissions, submit, error handling, redirect on success.
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

interface ResourceCreatePageProps<T extends CmsRecord, Input extends Record<string, unknown>> {
  config:     CmsResourceConfig<T>;
  service:    CmsResourceService<T, Input>;
  // Schema may be a strict ZodSchema or a relaxed partial — cast at boundary
  schema:     ZodSchema<Input> | ZodSchema<Partial<Input>>;
  children:   (handle: FormHandle<Input>) => React.ReactNode;
  /** Where to redirect after successful create. Default: config.routes.adminPath/[id] */
  successRedirect?: (id: string) => string;
}

export function ResourceCreatePage<T extends CmsRecord, Input extends Record<string, unknown>>({
  config, service, schema, children, successRedirect,
}: ResourceCreatePageProps<T, Input>) {
  const router = useRouter();
  const [saveState,    setSaveState]    = useState<CmsFormSaveState>("idle");
  const [serverError,  setServerError]  = useState<CmsError | null>(null);

  const handleSubmit = useCallback(async (data: Input): Promise<CmsError | null> => {
    setSaveState("saving");
    setServerError(null);
    const result = await service.create(data);
    if (!result.success) {
      const error = parseCmsError(result as { success: false; error: string; code?: string; fields?: Record<string,string> });
      setServerError(error);
      setSaveState("error");
      return error;
    }
    setSaveState("saved");
    const id = (result.data as CmsRecord | undefined)?.id ?? "";
    const redirect = successRedirect ? successRedirect(id) : `${config.routes.adminPath}/${id}`;
    router.push(redirect);
    return null;
  }, [service, config, router, successRedirect]);

  return (
    <PageContainer>
      <PageHeader
        icon={config.meta.icon}
        title={`Add ${config.meta.label}`}
        breadcrumb={
          <CmsBreadcrumb items={[
            { label: "Admin", href: "/admin/dashboard" },
            { label: config.meta.labelPlural, href: config.routes.adminPath },
            { label: "New" },
          ]} />
        }
      />

      <CmsForm
        schema={schema as ZodSchema<Input>}
        onSubmit={handleSubmit}
        onCancel={() => router.push(config.routes.adminPath)}
        submitLabel={`Create ${config.meta.label}`}
        saveState={saveState}
        serverError={serverError}
        resourceLabel={config.meta.label.toLowerCase()}
      >
        {children}
      </CmsForm>
    </PageContainer>
  );
}
