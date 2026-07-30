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
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
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

// ─── Appointment slots ────────────────────────────────────────────────────────
/** Change to 15 for quarter-hour granularity. */
const SLOT_MINUTES = 30;
const START_HOUR   = 9;   // first slot  9:00 AM
const END_HOUR     = 19;  // last slot   7:00 PM

/**
 * LABEL is 12-hour (what staff and patients read); VALUE stays 24-hour "HH:mm"
 * so the API contract and stored data are unchanged.
 */
const TIME_SLOTS: { value: string; label: string }[] = (() => {
  const slots: { value: string; label: string }[] = [];
  for (let mins = START_HOUR * 60; mins <= END_HOUR * 60; mins += SLOT_MINUTES) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const hh = String(h).padStart(2, "0");
    const mm = String(m).padStart(2, "0");
    const h12 = h % 12 === 0 ? 12 : h % 12;
    const period = h < 12 ? "AM" : "PM";
    slots.push({ value: `${hh}:${mm}`, label: `${h12}:${mm} ${period}` });
  }
  return slots;
})();

/** "14:30" → "2:30 PM" (for the summary line). */
function to12Hour(value: string): string {
  return TIME_SLOTS.find(s => s.value === value)?.label ?? value;
}

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
  // Trim any seconds ("14:30:00" → "14:30") so a stored value preselects correctly.
  const [time, setTime]     = useState((confirmedTime ?? "").slice(0, 5));
  const [note, setNote]     = useState(notes);
  const [busy, setBusy]     = useState(false);
  const [error, setError]   = useState<string | null>(null);
  const [pending, setPending] = useState<AppointmentStatus | null>(null);

  const allowed    = APPOINTMENT_TRANSITIONS[currentStatus] ?? [];
  const isTerminal = allowed.length === 0;
  /** Approval needs both fields — disable the button rather than fail server-side. */
  const scheduleReady = Boolean(date && time);

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
    <SectionCard title="Workflow" description="Set the confirmed date and time, then approve. The patient is emailed automatically.">
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
            <Select value={time} onValueChange={setTime} disabled={busy}>
              <SelectTrigger id="confirmedTime">
                <SelectValue placeholder="Select a time…" />
              </SelectTrigger>
              {/* overflow-y-auto overrides the panel's overflow-hidden so the
                  fixed-height list scrolls internally instead of being clipped. */}
              <SelectContent className="max-h-72 overflow-y-auto">
                {TIME_SLOTS.map(slot => (
                  <SelectItem key={slot.value} value={slot.value}>{slot.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>

        {/* Plain-language confirmation of exactly what the patient will be told. */}
        {scheduleReady && (
          <p className="rounded-lg bg-primary-50 px-3 py-2 text-sm text-primary-800">
            Patient will be confirmed for{" "}
            <strong>{new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
              weekday: "long", day: "numeric", month: "long", year: "numeric",
            })}</strong>{" "}at <strong>{to12Hour(time)}</strong>.
          </p>
        )}

        <FormField id="adminNotes" label="Internal Notes" hint="Visible to staff only. Max 500 characters.">
          <Textarea
            id="adminNotes" value={note} maxLength={500} rows={3}
            onChange={e => setNote(e.target.value)}
            disabled={busy}
          />
        </FormField>

        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

        {allowed.includes("approved") && !scheduleReady && (
          <p className="text-sm text-muted-foreground">
            Select a confirmed date and time to enable approval.
          </p>
        )}

        <div className="flex flex-wrap gap-2 border-t border-border pt-4">
          {allowed.map(target => (
            <Button
              key={target}
              size="sm"
              variant={DESTRUCTIVE.includes(target) ? "destructive" : target === "approved" || target === "completed" ? "primary" : "secondary"}
              disabled={busy || (target === "approved" && !scheduleReady)}
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