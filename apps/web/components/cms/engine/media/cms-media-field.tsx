"use client";
/**
 * CmsMediaField — FormHandle adapter over MediaUploadControl.
 * Resources use this inside CmsForm; legacy controlled forms use
 * MediaUploadControl directly. One upload implementation.
 */
import type { FieldValues, Path } from "react-hook-form";
import type { FormHandle }        from "@/components/cms/engine/form/cms-form";
import {
  MediaUploadControl,
  type MediaFieldValue,
  type MediaUploadFolder,
} from "./media-upload-control";

export type { MediaFieldValue, MediaUploadFolder };

interface CmsMediaFieldProps<T extends FieldValues> {
  handle:      FormHandle<T>;
  name:        Path<T>;
  label:       string;
  folder:      MediaUploadFolder;
  hint?:       string;
  required?:   boolean;
  disabled?:   boolean;
  withAlt?:    boolean;
  aspectRatio?: "1/1" | "4/3" | "16/9" | "3/2";
  className?:  string;
}

export function CmsMediaField<T extends FieldValues>({
  handle, name, ...rest
}: CmsMediaFieldProps<T>) {
  const value = handle.getValue(name) as MediaFieldValue | null | undefined;
  const fieldError = (handle.errors as Record<string, { message?: string } | undefined>)[name as string];
  return (
    <MediaUploadControl
      value={value}
      onChange={v => handle.setValue(name, v)}
      errorMessage={fieldError?.message ? String(fieldError.message) : undefined}
      {...rest}
    />
  );
}
