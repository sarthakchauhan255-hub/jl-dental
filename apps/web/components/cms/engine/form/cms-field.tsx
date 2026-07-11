"use client";
/**
 * CmsField — generic field renderer.
 *
 * ARCHITECTURE:
 *  • Accepts FormHandle (not UseFormReturn) — isolation maintained.
 *  • No react-hook-form import at the resource layer.
 *  • Resources pass CmsFormField config; this component renders the correct input.
 */
import { FormField }          from "@/components/cms/form-field";
import { Input }              from "@/components/ui/input";
import { Textarea }           from "@/components/ui/textarea";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { generateSlug }       from "@/lib/cms/validation";
import type { CmsFormField }  from "@/lib/cms/types";
import type { FormHandle }    from "./cms-form";
import type { FieldValues }   from "react-hook-form";

interface CmsFieldProps<T extends FieldValues> {
  config: CmsFormField;
  handle: FormHandle<T>;
}

export function CmsField<T extends FieldValues>({ config, handle }: CmsFieldProps<T>) {
  const { register, errors, getValue, setValue } = handle;
  const error = (errors[config.name]?.message as string) ?? undefined;

  // Conditional display
  const allValues: Record<string, unknown> = {};
  // We snapshot visible field values for showWhen evaluation
  if (config.showWhen) {
    // Evaluate using getValue for the field's own name to check context
    const show = config.showWhen({ [config.name]: getValue(config.name as Parameters<FormHandle<T>["getValue"]>[0]) });
    if (!show) return null;
  }

  return (
    <FormField
      id={config.name}
      label={config.label}
      required={config.required}
      hint={config.hint}
      error={error}
    >
      {renderInput(config, handle)}
    </FormField>
  );
}

function renderInput<T extends FieldValues>(
  config: CmsFormField,
  handle: FormHandle<T>,
): React.ReactNode {
  const { register, getValue, setValue } = handle;

  switch (config.type) {
    case "text":
    case "email":
    case "url":
      return (
        <Input
          id={config.name}
          type={config.type}
          placeholder={config.placeholder}
          {...register(config.name as Parameters<typeof register>[0])}
        />
      );

    case "number":
      return (
        <Input
          id={config.name}
          type="number"
          placeholder={config.placeholder}
          {...register(config.name as Parameters<typeof register>[0], { valueAsNumber: true })}
        />
      );

    case "slug": {
      const slugName = config.name as Parameters<typeof register>[0];
      return (
        <Input
          id={config.name}
          placeholder={config.placeholder ?? "url-slug"}
          {...register(slugName, {
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
              const cleaned = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");
              setValue(slugName as Parameters<FormHandle<T>["setValue"]>[0], cleaned);
            },
          })}
        />
      );
    }

    case "textarea":
      return (
        <Textarea
          id={config.name}
          rows={5}
          placeholder={config.placeholder}
          {...register(config.name as Parameters<typeof register>[0])}
        />
      );

    case "toggle":
      return (
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            {...register(config.name as Parameters<typeof register>[0])}
            className="h-4 w-4 rounded border-charcoal-300 text-primary-700 focus:ring-primary-400"
          />
          <span className="text-sm text-charcoal-600">{config.hint ?? `Enable ${config.label}`}</span>
        </label>
      );

    case "select": {
      const current = getValue(config.name as Parameters<FormHandle<T>["getValue"]>[0]);
      return (
        <Select
          defaultValue={typeof current === "string" ? current : undefined}
          onValueChange={v => setValue(config.name as Parameters<FormHandle<T>["setValue"]>[0], v)}
        >
          <SelectTrigger id={config.name}>
            <SelectValue placeholder={config.placeholder ?? `Select ${config.label}`} />
          </SelectTrigger>
          <SelectContent>
            {config.options?.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    case "tags": {
      const currentTags = getValue(config.name as Parameters<FormHandle<T>["getValue"]>[0]);
      const tagsStr = Array.isArray(currentTags) ? (currentTags as string[]).join(", ") : "";
      return (
        <Input
          id={config.name}
          placeholder={config.placeholder ?? "tag1, tag2, tag3"}
          defaultValue={tagsStr}
          onChange={e => {
            const tags = e.target.value.split(",").map(t => t.trim()).filter(Boolean);
            setValue(config.name as Parameters<FormHandle<T>["setValue"]>[0], tags);
          }}
        />
      );
    }

    default:
      return (
        <Input
          id={config.name}
          placeholder={config.placeholder}
          {...register(config.name as Parameters<typeof register>[0])}
        />
      );
  }
}
