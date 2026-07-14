import type { Metadata }    from "next";
import { redirect }         from "next/navigation";
import { getAuthUser }      from "@/lib/auth/session";
import { hasPermission }    from "@/lib/auth/rbac";
import { connectDB }        from "@/lib/db/connection";
import { Review }           from "@/models/Review";
import { ResourceListPage } from "@/components/cms/engine";
import { reviewConfig }     from "@/features/reviews/config/reviews.config";
import { reviewService }    from "@/features/reviews/service/reviews.service";
import type { ReviewRecord } from "@/features/reviews/service/reviews.service";
import { mapReview }          from "@/lib/db/mappers";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Reviews | Admin", robots: { index: false, follow: false } };

export default async function ReviewsAdminPage() {
  const user = await getAuthUser();
  if (!user || !hasPermission(user.role, "reviews.read")) redirect("/admin/dashboard");

  await connectDB();
  const [docs, total] = await Promise.all([
    Review.find({ status: "pending" }).sort({ createdAt: -1 }).limit(10).lean(),
    Review.countDocuments({ status: "pending" }),
  ]);

  const initialData: ReviewRecord[] = docs.map(mapReview) as ReviewRecord[];

  return (
    <ResourceListPage
      config={reviewConfig}
      service={reviewService}
      initialData={initialData}
      initialTotal={total}
      user={user}
    />
  );
}
