"use client";
/**
 * BlogCreateClient — client boundary for the blog "new" page.
 * config/service/schema/form-fields all contain functions, which cannot be
 * passed from a Server Component. They are imported here on the client instead.
 */
import { ResourceCreatePage } from "@/components/cms/engine";
import { blogConfig } from "@/features/blog/config/blog.config";
import { blogService } from "@/features/blog/service/blog.service";
import { BlogFormFields } from "@/features/blog/components/blog-form-fields";
import { blogPostCreateSchema } from "@/lib/validations";
import type { ZodSchema } from "zod";
import type { BlogInput } from "@/features/blog/service/blog.service";

export function BlogCreateClient() {
  return (
    <ResourceCreatePage
      config={blogConfig}
      service={blogService}
      schema={blogPostCreateSchema as unknown as ZodSchema<BlogInput>}
    >
      {handle => <BlogFormFields handle={handle} />}
    </ResourceCreatePage>
  );
}
