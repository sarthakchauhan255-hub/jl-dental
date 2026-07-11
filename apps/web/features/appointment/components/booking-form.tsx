"use client";
import { useState, type FormEvent } from "react";
import { Input }    from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label }    from "@/components/ui/label";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { Button }   from "@/components/ui/button";
import { TIME_SLOTS, URGENCY_LEVELS } from "@/lib/constants/statuses";
import type { ServiceContent } from "@/features/services/schemas/service.schema";

interface BookingFormProps {
  services: ServiceContent[];
}

/**
 * Phase 5 scope: UI shell only. Form validates client-side and shows a
 * confirmation state on submit, but does NOT call a processing API —
 * the appointment submission endpoint is implemented in Phase 6.
 */
export function BookingForm({ services }: BookingFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [errors, setErrors]       = useState<Record<string, string>>({});

  const [patientName, setPatientName]     = useState("");
  const [phone, setPhone]                 = useState("");
  const [email, setEmail]                 = useState("");
  const [serviceId, setServiceId]         = useState<string>("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState<string>("");
  const [urgencyLevel, setUrgencyLevel]   = useState("normal");
  const [notes, setNotes]                 = useState("");
  const [website, setWebsite]             = useState(""); // honeypot — humans never see it
  const [serverError, setServerError]     = useState<string | null>(null);
  const [reference, setReference]         = useState<string | null>(null);

  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const maxDate  = new Date(Date.now() + 60 * 86400000).toISOString().split("T")[0];

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (patientName.trim().length < 2) nextErrors.patientName = "Please enter your full name";
    if (phone.trim().length < 7)        nextErrors.phone = "Please enter a valid phone number";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = "Please enter a valid email";
    if (!preferredDate)                 nextErrors.preferredDate = "Please select a date";
    if (!preferredTime)                 nextErrors.preferredTime = "Please select a time";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    setServerError(null);
    void (async () => {
      try {
        const res = await fetch("/api/appointments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patientName, phone, email,
            ...(serviceId ? { serviceId } : {}),
            preferredDate, preferredTime, urgencyLevel, notes,
            honeypot: website, // hidden field — must be empty
          }),
        });
        const json = await res.json() as {
          success: boolean; error?: string;
          fields?: Record<string, string>;
          data?: { reference?: string };
        };
        if (!json.success) {
          if (res.status === 429) {
            setServerError("Too many requests — please try again in a little while, or call us directly.");
          } else if (json.fields) {
            setErrors(json.fields);
          } else {
            setServerError(json.error ?? "Something went wrong. Please try again or call us.");
          }
          return;
        }
        setReference(json.data?.reference ?? null);
        setSubmitted(true);
      } catch {
        setServerError("Network error — please check your connection and try again.");
      } finally {
        setLoading(false);
      }
    })();
  }

  if (submitted) {
    return (
      <div role="status" className="text-center py-12">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 mb-5">
          <span className="text-green-600 text-2xl" aria-hidden="true">✓</span>
        </div>
        <h2 className="heading-3 mb-3">Request Received</h2>
        <p className="body-base text-muted-foreground max-w-md mx-auto">
          Thank you, {patientName.split(" ")[0]}. We&apos;ll confirm your appointment for{" "}
          <strong>{preferredDate}</strong> within a few hours via email
          {reference && <> — your reference is <strong>#{reference}</strong></>}.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Honeypot — visually hidden from humans, bots fill it and get rejected */}
      <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off"
          value={website} onChange={e => setWebsite(e.target.value)} />
      </div>
      {/* Honeypot — hidden from real users, bots fill it in */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <Label htmlFor="patientName" required>Full Name</Label>
          <Input id="patientName" value={patientName} onChange={(e) => setPatientName(e.target.value)}
            error={!!errors.patientName} aria-describedby={errors.patientName ? "patientName-error" : undefined} />
          {errors.patientName && <p id="patientName-error" role="alert" className="text-xs text-destructive">{errors.patientName}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone" required>Phone Number</Label>
          <Input id="phone" type="tel" placeholder="+91 98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)}
            error={!!errors.phone} aria-describedby={errors.phone ? "phone-error" : undefined} />
          {errors.phone && <p id="phone-error" role="alert" className="text-xs text-destructive">{errors.phone}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email" required>Email Address</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          error={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} />
        {errors.email && <p id="email-error" role="alert" className="text-xs text-destructive">{errors.email}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="service">Service Interested In</Label>
        <Select value={serviceId} onValueChange={setServiceId}>
          <SelectTrigger id="service"><SelectValue placeholder="Not sure — I'll discuss with the doctor" /></SelectTrigger>
          <SelectContent>
            {services.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <Label htmlFor="preferredDate" required>Preferred Date</Label>
          <Input id="preferredDate" type="date" min={tomorrow} max={maxDate}
            value={preferredDate} onChange={(e) => setPreferredDate(e.target.value)}
            error={!!errors.preferredDate} />
          {errors.preferredDate && <p role="alert" className="text-xs text-destructive">{errors.preferredDate}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="preferredTime" required>Preferred Time</Label>
          <Select value={preferredTime} onValueChange={setPreferredTime}>
            <SelectTrigger id="preferredTime" error={!!errors.preferredTime}><SelectValue placeholder="Select a time" /></SelectTrigger>
            <SelectContent>
              {TIME_SLOTS.map((slot) => (
                <SelectItem key={slot.value} value={slot.value}>{slot.label} ({slot.hint})</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.preferredTime && <p role="alert" className="text-xs text-destructive">{errors.preferredTime}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="urgency">Urgency</Label>
        <Select value={urgencyLevel} onValueChange={setUrgencyLevel}>
          <SelectTrigger id="urgency"><SelectValue /></SelectTrigger>
          <SelectContent>
            {URGENCY_LEVELS.map((u) => (
              <SelectItem key={u.value} value={u.value}>{u.label} — {u.hint}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Additional Notes (optional)</Label>
        <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={500}
          placeholder="Anything else we should know?" />
      </div>

      {serverError && (


        <p role="alert" className="text-sm text-destructive text-center">{serverError}</p>


      )}

      <Button type="submit" size="lg" disabled={loading} className="w-full">
        {loading ? "Submitting…" : "Request Appointment"}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        We&apos;ll confirm within a few hours. Prefer WhatsApp?{" "}
        <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
          Chat with us →
        </a>
      </p>
    </form>
  );
}
