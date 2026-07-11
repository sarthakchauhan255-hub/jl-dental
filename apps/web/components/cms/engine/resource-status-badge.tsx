/**
 * ResourceStatusBadge — renders a status badge for any resource.
 *
 * Resources provide their CmsStatusDefinition which maps to a CmsBadgeVariant.
 * Badge component decides visual styling — resources do NOT hardcode colors.
 */
import { Badge }            from "@/components/ui/badge";
import type { CmsStatusDefinition, CmsBadgeVariant } from "@/lib/cms/types";

const BADGE_VARIANT_MAP: Record<CmsBadgeVariant, "approved" | "rejected" | "pending"> = {
  success: "approved",
  error:   "rejected",
  warning: "pending",
  info:    "approved",
  neutral: "rejected",
};

interface ResourceStatusBadgeProps {
  /** Full status definition from the resource's status config */
  definition?: CmsStatusDefinition<string>;
  /** Simple boolean toggle alternative (no status system) */
  active?:     boolean;
  /** Raw string fallback when no definition available */
  label?:      string;
}

export function ResourceStatusBadge({ definition, active, label }: ResourceStatusBadgeProps) {
  // Simple boolean active/inactive
  if (typeof active === "boolean") {
    return <Badge variant={active ? "approved" : "rejected"}>{active ? "Active" : "Inactive"}</Badge>;
  }

  // Status definition provided
  if (definition) {
    return (
      <Badge variant={BADGE_VARIANT_MAP[definition.badgeVariant] ?? "pending"}>
        {definition.label}
      </Badge>
    );
  }

  // Fallback label
  return <Badge variant="pending">{label ?? "Unknown"}</Badge>;
}
