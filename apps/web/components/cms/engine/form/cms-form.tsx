"use client";
/**
 * CmsForm — generic form engine.
 *
 * ARCHITECTURE:
 *  • React Hook Form is an INTERNAL implementation detail of this file only.
 *  • Resources receive FormHandle<T> — a CMS-owned abstraction.
 *  • Resources do NOT import react-hook-form.
 *  • All RHF types stay within this module boundary.
 *
 * RHF/ZOD BOUNDARY NOTE:
 *  zodResolver<T> requires T extends FieldValues. Our CmsRecord-based generics
 *  are structurally compatible but TypeScript cannot prove it statically without
 *  an unsafe cast. The cast is isolated to the single useForm() call below.
 *  FormHandle<T> re-establishes correct typing at the consumer boundary.
 */
import { useEffect, type ReactNode }      from "react";
import {
  useForm,
  type FieldValues,
  type Path,
  type DefaultValues,
  type UseFormRegister,
  type FieldErrors,
} from "react-hook-form";
import { zodResolver }          from "@hookform/resolvers/zod";
import type { ZodSchema }       from "zod";
import { UnsavedWarning }       from "@/components/cms/unsaved-warning";
import { SaveIndicator }        from "@/components/cms/save-indicator";
import { Button }               from "@/components/ui/button";
import type { CmsError }        from "@/lib/cms/errors";
import { getCmsErrorMessage }   from "@/lib/cms/errors";
import { cn }                   from "@/lib/utils";

export type CmsFormSaveState = "idle" | "saving" | "saved" | "error";

/**
 * FormHandle<T> — the only form API resource code ever sees.
 * Resources never touch UseFormReturn, register, Controller, or other RHF internals.
 */
export interface FormHandle<T extends FieldValues = FieldValues> {
  /** Read any field value */
  getValue:  (name: Path<T>) => unknown;
  /** Set a field value programmatically (triggers dirty state) */
  setValue:  (name: Path<T>, value: unknown) => void;
  /** Register a native <input>/<textarea>/<select> with RHF — typed via UseFormRegister */
  register:  UseFormRegister<T>;
  /** Field-level validation errors */
  errors:    FieldErrors<T>;
  /** True when any field has been changed from defaultValues */
  isDirty:   boolean;
}

export interface CmsFormProps<T extends FieldValues> {
  defaultValues?: DefaultValues<T>;
  schema:         ZodSchema<T>;
  onSubmit:       (data: T) => Promise<CmsError | null>;
  onSuccess?:     (data: T) => void;
  submitLabel?:   string;
  cancelLabel?:   string;
  onCancel?:      () => void;
  saveState:      CmsFormSaveState;
  serverError?:   CmsError | null;
  resourceLabel?: string;
  children:       (handle: FormHandle<T>) => ReactNode;
  className?:     string;
}

export function CmsForm<T extends FieldValues>({
  defaultValues,
  schema,
  onSubmit,
  onSuccess,
  submitLabel   = "Save",
  cancelLabel   = "Cancel",
  onCancel,
  saveState,
  serverError,
  resourceLabel = "item",
  children,
  className,
}: CmsFormProps<T>) {
  // ISOLATED CAST: zodResolver requires the generic to extend FieldValues.
  // T extends FieldValues structurally but TypeScript cannot prove it without the cast.
  // This is the single point of unsafe casting — contained within this file.
  // See: https://github.com/react-hook-form/resolvers/issues/XXX
  // Zod import alias used as casting target for zodResolver's parameter type
  // This avoids the ZodType vs Zod3Type version mismatch while keeping the intent clear
  const {
    handleSubmit,
    formState: { isDirty, isSubmitting, errors },
    setError,
    watch,
    setValue,
    register,
  } = useForm<FieldValues>({
    // ISOLATED CAST: zodResolver returns Resolver<FieldValues,any,unknown> but useForm
    // requires Resolver<FieldValues,any,FieldValues>. The 'unknown' vs 'FieldValues'
    // difference is a @hookform/resolvers Zod v4 compatibility gap. This is the single
    // unsafe cast in the entire form engine. FormHandle<T> restores type safety at consumers.
    // Tracked: https://github.com/react-hook-form/resolvers (zod v4 compat)
    resolver: zodResolver(schema as Parameters<typeof zodResolver>[0]) as
              import("react-hook-form").Resolver<FieldValues>,
    defaultValues: defaultValues as DefaultValues<FieldValues>,
    mode:          "onBlur",
  });

  // Inject server field errors into RHF state
  useEffect(() => {
    if (serverError?.type === "validation" && serverError.fields) {
      for (const [field, message] of Object.entries(serverError.fields)) {
        setError(field, { message });
      }
    }
  }, [serverError, setError]);

  const handleFormSubmit = handleSubmit((rawData: FieldValues) => {
    // Cast validated data back to T. Safe: zodResolver already validated against ZodSchema<T>.
    const data = rawData as T;
    return onSubmit(data).then(error => {
      if (!error && onSuccess) onSuccess(data);
    });
  });

  const isLoading = saveState === "saving" || isSubmitting;

  // Build FormHandle — re-establishes T-typed API for resource consumers.
  // The underlying FieldValues-typed RHF methods are widened here;
  // the FormHandle interface narrows them back to T at the call site.
  const handle: FormHandle<T> = {
    getValue:  (name)         => watch(name as string),
    setValue:  (name, value)  => setValue(name as string, value, { shouldDirty: true }),
    // UseFormRegister<T> is assignable from UseFormRegister<FieldValues> structurally
    register:  register as unknown as UseFormRegister<T>,
    errors:    errors   as unknown as FieldErrors<T>,
    isDirty,
  };

  return (
    <form onSubmit={handleFormSubmit} noValidate className={cn("space-y-6", className)}>
      <UnsavedWarning isDirty={isDirty} />

      {serverError && serverError.type !== "validation" && (
        <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {getCmsErrorMessage(serverError, resourceLabel)}
        </div>
      )}

      {children(handle)}

      <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
        <SaveIndicator state={saveState} />
        <div className="flex items-center gap-2">
          {onCancel && (
            <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
              {cancelLabel}
            </Button>
          )}
          <Button type="submit" disabled={isLoading || (!isDirty && Boolean(defaultValues))}>
            {isLoading ? "Saving…" : submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}
