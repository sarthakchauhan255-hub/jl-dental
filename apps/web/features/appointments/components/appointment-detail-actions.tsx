"use client";
/**
 * AppointmentDetailActions — workflow actions for the appointment detail page.
 *
 * Renders only transitions valid FROM the current status (client visibility);
 * the server independently re-validates every transition (422 on invalid).
 * Approval requires confirmed date + time (also server-enforced).
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button }        from "@/components/ui/button";
import { Input }         from "@/components/ui/input";
import { Textarea }      from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/cms/confirm-dialog";
import { SectionCard }   from "@/components/cms/section-card";
import { FormField }     from "@/components/cms/form-field";
import {
  APPOINTMENT_TRANSITIONS,
  type AppointmentStatus,
} from "../service/appointments.service";

const ACTION_LABELS: Partial<Record<AppointmentStatus, string>> = {
  approved:  "Approve",
  completed: "Mark Completed",
  rejected:  "Reject",
  cancelled: "Cancel",
  no_show:   "Mark No-Show",
  rescheduled: "Mark Rescheduled",
};

const DESTRUCTIVE: AppointmentStatus[] = ["rejected", "cancelled", "no_show"];

interface Props {
  appointmentId: string;
  currentStatus: AppointmentStatus;
  confirmedDate: string | null;
  confirmedTime: string | null;
  notes:         string;
}

export function AppointmentDetailActions({
  appointmentId, currentStatus, confirmedDate, confirmedTime, notes,
}: Props) {
  const router = useRouter();
  const [date, setDate]     = useState(confirmedDate ?? "");
  const [time, setTime]     = useState(confirmedTime ?? "");
  const [note, setNote]     = useState(notes);
  const [busy, setBusy]     = useState(false);
  const [error, setError]   = useState<string | null>(null);
  const [pending, setPending] = useState<AppointmentStatus | null>(null);

  const allowed = APPOINTMENT_TRANSITIONS[currentStatus] ?? [];
  const isTerminal = allowed.length === 0;

  async function execute(target: AppointmentStatus) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: target,
          ...(date ? { confirmedDate: date } : {}),
          ...(time ? { confirmedTime: time } : {}),
          ...(note ? { adminNotes: note } : {}),
        }),
      });
      const json = await res.json() as { success: boolean; error?: string; fields?: Record<string, string> };
      if (!json.success) {
        setError(json.error ?? "Update failed.");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error — please retry.");
    } finally {
      setBusy(false);
      setPending(null);
    }
  }

  function trigger(target: AppointmentStatus) {
    if (DESTRUCTIVE.includes(target)) setPending(target);
    else void execute(target);
  }

  if (isTerminal) {
    return (
      <SectionCard title="Workflow" description="This appointment is in a terminal state — no further transitions are allowed.">
        <p className="text-sm text-charcoal-500">No actions available.</p>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Workflow" description="Confirmed date and time are required for approval. All transitions are validated server-side.">
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField id="confirmedDate" label="Confirmed Date">
            <Input
              id="confirmedDate" type="date" value={date}
              onChange={e => setDate(e.target.value)}
              disabled={busy}
            />
          </FormField>
          <FormField id="confirmedTime" label="Confirmed Time">
            <Input
              id="confirmedTime" type="time" value={time}
              onChange={e => setTime(e.target.value)}
              disabled={busy}
            />
          </FormField>
        </div>

        <FormField id="adminNotes" label="Internal Notes" hint="Visible to staff only. Max 500 characters.">
          <Textarea
            id="adminNotes" value={note} maxLength={500} rows={3}
            onChange={e => setNote(e.target.value)}
            disabled={busy}
          />
        </FormField>

        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

        <div className="flex flex-wrap gap-2 border-t border-border pt-4">
          {allowed.map(target => (
            <Button
              key={target}
              size="sm"
              variant={DESTRUCTIVE.includes(target) ? "destructive" : target === "approved" || target === "completed" ? "primary" : "secondary"}
              disabled={busy}
              onClick={() => trigger(target)}
            >
              {ACTION_LABELS[target] ?? target}
            </Button>
          ))}
        </div>
      </div>

      {pending && (
        <ConfirmDialog
          open
          onOpenChange={() => setPending(null)}
          title={`${ACTION_LABELS[pending] ?? pending}?`}
          description="This transition cannot be reversed once the appointment reaches a terminal state."
          confirmLabel="Confirm"
          destructive
          loading={busy}
          onConfirm={() => void execute(pending)}
        />
      )}
    </SectionCard>
  );
}
