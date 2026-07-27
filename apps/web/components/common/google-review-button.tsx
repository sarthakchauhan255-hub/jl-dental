import { Star } from "lucide-react";
import { GOOGLE_REVIEWS } from "@/config/google-reviews";

/**
 * "Review us on Google" button. Responsive: full-width on mobile, inline on desktop.
 * variant="solid" for prominent CTAs, "outline" for secondary placements (footer).
 */
export function GoogleReviewButton({
  variant = "solid",
  className = "",
  label = "Review us on Google",
}: {
  variant?: "solid" | "outline";
  className?: string;
  label?: string;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-medium transition-colors";
  const styles =
    variant === "solid"
      ? "bg-primary-700 text-white hover:bg-primary-800"
      : "border border-primary-700 text-primary-700 hover:bg-primary-50";
  return (
    <a
      href={GOOGLE_REVIEWS.REVIEW_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`${base} ${styles} ${className}`}
    >
      <Star className="h-4 w-4 fill-current" aria-hidden="true" />
      {label}
    </a>
  );
}
