"use client";
/**
 * MediaUploadControl — controlled media upload core.
 *
 * The single client-side gateway to /api/uploads. Both CmsMediaField
 * (FormHandle integration) and legacy controlled forms (Clinic Settings)
 * compose this — one upload implementation, zero duplication.
 */
import { useRef, useState, useCallback, useId } from "react";
import { OptimizedImage } from "@/components/common/optimized-image";
import { Button }         from "@/components/ui/button";
import { Loader2, Upload, X, RefreshCw } from "lucide-react";
import { cn }             from "@/lib/utils";

export type MediaUploadFolder =
  | "clinic" | "doctors" | "services" | "blog"
  | "gallery/before-after" | "gallery/general";

export interface MediaFieldValue {
  url:      string;
  publicId: string;
  alt?:     string;
}

interface MediaUploadControlProps {
  value:       MediaFieldValue | null | undefined;
  onChange:    (value: MediaFieldValue | null) => void;
  label:       string;
  folder:      MediaUploadFolder;
  hint?:       string;
  required?:   boolean;
  disabled?:   boolean;
  withAlt?:    boolean;
  aspectRatio?: "1/1" | "4/3" | "16/9" | "3/2";
  errorMessage?: string;
  className?:  string;
}

type UploadState = "idle" | "uploading" | "error";

export function MediaUploadControl({
  value, onChange, label, folder, hint,
  required, disabled, withAlt, aspectRatio = "4/3", errorMessage, className,
}: MediaUploadControlProps) {
  const inputId  = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState]       = useState<UploadState>("idle");
  const [uploadError, setError] = useState<string | null>(null);

  const doUpload = useCallback(async (file: File) => {
    setState("uploading");
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", folder);
      const res  = await fetch("/api/uploads", { method: "POST", body: fd });
      const json = await res.json() as {
        success: boolean; error?: string;
        data?: { url: string; publicId: string };
      };
      if (!json.success || !json.data) {
        setError(json.error ?? "Upload failed. Please try again.");
        setState("error");
        return;
      }
      onChange({ url: json.data.url, publicId: json.data.publicId, ...(value?.alt ? { alt: value.alt } : {}) });
      setState("idle");
    } catch {
      setError("Network error during upload.");
      setState("error");
    }
  }, [folder, onChange, value?.alt]);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void doUpload(file);
    e.target.value = "";
  }

  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={inputId} className="block text-sm font-medium text-charcoal-800">
        {label}
        {required && <span aria-hidden="true" className="ml-0.5 text-destructive">*</span>}
      </label>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        disabled={disabled || state === "uploading"}
        onChange={onFileChange}
        aria-describedby={hint ? `${inputId}-hint` : undefined}
      />

      <div className={cn(
        "relative overflow-hidden rounded-lg border border-border bg-cream-50 max-w-sm",
        aspectRatio === "1/1"  && "aspect-square",
        aspectRatio === "4/3"  && "aspect-[4/3]",
        aspectRatio === "16/9" && "aspect-video",
        aspectRatio === "3/2"  && "aspect-[3/2]",
      )}>
        {value?.url ? (
          <OptimizedImage
            src={value.url}
            alt={value.alt ?? label}
            fill
            sizes="(max-width: 640px) 100vw, 384px"
            className="object-contain"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-charcoal-400">
            {state === "uploading" ? (
              <span className="flex items-center gap-2" role="status">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Uploading…
              </span>
            ) : "No image selected"}
          </div>
        )}
        {state === "uploading" && value?.url && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70" role="status">
            <Loader2 className="h-5 w-5 animate-spin text-charcoal-600" aria-hidden="true" />
            <span className="sr-only">Uploading…</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" variant="secondary"
          disabled={disabled || state === "uploading"}
          onClick={() => inputRef.current?.click()}>
          <Upload className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
          {value?.url ? "Replace" : "Upload"}
        </Button>
        {value?.url && (
          <Button type="button" size="sm" variant="ghost"
            disabled={disabled || state === "uploading"}
            onClick={() => { onChange(null); setState("idle"); setError(null); }}>
            <X className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
            Remove
          </Button>
        )}
        {state === "error" && (
          <Button type="button" size="sm" variant="ghost" onClick={() => inputRef.current?.click()}>
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
            Retry
          </Button>
        )}
      </div>

      {withAlt && value?.url && (
        <div>
          <label htmlFor={`${inputId}-alt`} className="block text-xs font-medium text-charcoal-600">
            Alt text
          </label>
          <input
            id={`${inputId}-alt`}
            type="text"
            defaultValue={value.alt ?? ""}
            onBlur={e => onChange({ ...value, alt: e.target.value })}
            disabled={disabled}
            className="mt-1 w-full max-w-sm rounded-md border border-border bg-white px-3 py-1.5 text-sm"
            placeholder="Describe the image for screen readers"
          />
        </div>
      )}

      {hint && <p id={`${inputId}-hint`} className="text-xs text-charcoal-500">{hint}</p>}
      {uploadError && <p role="alert" className="text-xs text-destructive">{uploadError}</p>}
      {errorMessage && <p role="alert" className="text-xs text-destructive">{errorMessage}</p>}
    </div>
  );
}
