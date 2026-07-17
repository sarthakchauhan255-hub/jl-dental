"use client";
/**
 * BlogEditClient — client boundary for the blog edit page.
 * Receives ONLY serializable data (record, defaultValues); imports the
 * function-carrying config/service/schema/form-fields itself.
 */
import { ResourceEditPage } from "@/components/cms/engine";
import { blogConfig } from "@/features/blog/config/blog.config";
import { blogService } from "@/features/blog/service/blog.service";
import { BlogFormFields } from "@/features/blog/components/blog-form-fields";
import { blogPostUpdateSchema } from "@/lib/validations";
import type { ZodSchema } from "zod";
import type { BlogRecord, BlogInput } from "@/features/blog/service/blog.service";

export function BlogEditClient({
  record, defaultValues,
}: {
  record: BlogRecord;
  defaultValues: Partial<BlogInput>;
}) {
  return (
    <ResourceEditPage
      config={blogConfig}
      service={blogService}
      schema={blogPostUpdateSchema as unknown as ZodSchema<BlogInput>}
      record={record}
      defaultValues={defaultValues}
    >
      {handle => <BlogFormFields handle={handle} isEdit />}
    </ResourceEditPage>
  );
}
