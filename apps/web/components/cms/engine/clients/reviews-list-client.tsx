"use client";
/**
 * ReviewsListClient — client boundary for the reviews list page.
 *
 * WHY THIS EXISTS: config and service contain FUNCTIONS (cell renderers,
 * action executors, service methods). Next.js forbids passing functions from a
 * Server Component to a Client Component. This wrapper imports them on the
 * client side instead, so the server page only passes serializable data.
 */
import { ResourceListPage } from "@/components/cms/engine";
import { reviewConfig } from "@/features/reviews/config/reviews.config";
import { reviewService } from "@/features/reviews/service/reviews.service";
import type { ReviewRecord } from "@/features/reviews/service/reviews.service";
import type { AuthUser } from "@/types/auth";

export function ReviewsListClient({
  initialData, initialTotal, user,
}: {
  initialData: ReviewRecord[];
  initialTotal: number;
  user: AuthUser | null;
}) {
  return (
    <ResourceListPage
      config={reviewConfig}
      service={reviewService}
      initialData={initialData}
      initialTotal={initialTotal}
      user={user}
    />
  );
}
