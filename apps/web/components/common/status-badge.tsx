import { Badge } from "@/components/ui/badge";
import type { AppointmentStatus, ReviewStatus } from "@/types";

const APPOINTMENT_LABELS: Record<AppointmentStatus, string> = {
  pending:     "Pending",
  approved:    "Approved",
  rescheduled: "Rescheduled",
  rejected:    "Rejected",
  cancelled:   "Cancelled",
  completed:   "Completed",
  no_show:     "No Show",
  expired:     "Expired",
};

export function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <Badge variant={status}>
      {APPOINTMENT_LABELS[status]}
    </Badge>
  );
}

const REVIEW_LABELS: Record<ReviewStatus, string> = {
  pending:  "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

export function ReviewStatusBadge({ status }: { status: ReviewStatus }) {
  const variant = status === "approved" ? "approved" : status === "rejected" ? "rejected" : "pending";
  return <Badge variant={variant}>{REVIEW_LABELS[status]}</Badge>;
}
