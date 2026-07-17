"use client";
/**
 * FaqListClient — client boundary for the faq list page.
 *
 * WHY THIS EXISTS: config and service contain FUNCTIONS (cell renderers,
 * action executors, service methods). Next.js forbids passing functions from a
 * Server Component to a Client Component. This wrapper imports them on the
 * client side instead, so the server page only passes serializable data.
 */
import { ResourceListPage } from "@/components/cms/engine";
import { faqConfig } from "@/features/faq/config/faq.config";
import { faqService } from "@/features/faq/service/faq.service";
import type { FaqRecord } from "@/features/faq/service/faq.service";
import type { AuthUser } from "@/types/auth";

export function FaqListClient({
  initialData, initialTotal, user,
}: {
  initialData: FaqRecord[];
  initialTotal: number;
  user: AuthUser | null;
}) {
  return (
    <ResourceListPage
      config={faqConfig}
      service={faqService}
      initialData={initialData}
      initialTotal={initialTotal}
      user={user}
    />
  );
}
