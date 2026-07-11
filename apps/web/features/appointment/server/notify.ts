/**
 * Appointment notifications — patient-facing email + WhatsApp.
 *
 * DESIGN:
 *  • Fire-and-forget: callers `void notify...().catch()`. A notification
 *    failure NEVER blocks or rolls back the booking/approval itself.
 *  • Zero-config no-op: with no provider env vars set, functions log intent
 *    and return — safe in every environment.
 *  • No PII in logs — only the appointment reference.
 */
// Dynamic imports keep provider SDKs out of route-module build graphs
async function mail()  { return (await import("@/lib/notifications/email")).sendEmail; }
async function wa()    { return (await import("@/lib/notifications/whatsapp")).sendWhatsApp; }
import { BRAND }        from "@/config/branding";
import { logger }       from "@/lib/logger";

/** Clinic phone/address are CMS content — read once per notification, safe fallbacks. */
async function getClinicContact(): Promise<{ phone: string; address: string }> {
  try {
    const { getCmsProvider } = await import("@/features/shared/cms");
    const clinic = await getCmsProvider().getClinicConfig();
    const contact = (clinic as { contact?: { phone?: string; address?: string } }).contact ?? {};
    return {
      phone:   contact.phone   ?? "",
      address: contact.address ?? `${BRAND.CITY}, ${BRAND.STATE}`,
    };
  } catch {
    return { phone: "", address: `${BRAND.CITY}, ${BRAND.STATE}` };
  }
}

const TIME_LABEL: Record<string, string> = {
  morning: "Morning (9 AM – 12 PM)",
  afternoon: "Afternoon (12 PM – 4 PM)",
  evening: "Evening (4 PM – 7 PM)",
};

interface ReceivedPayload {
  patientName: string; email: string; phone: string;
  preferredDate: string; preferredTime: string;
}

/** Sent immediately after a public booking request is persisted. */
export async function notifyAppointmentReceived(p: ReceivedPayload): Promise<void> {
  const timeLabel = TIME_LABEL[p.preferredTime] ?? p.preferredTime;
  const { phone } = await getClinicContact();
  const callLine = phone ? `If anything changes, call us at ${phone}.` : `If anything changes, reply to this email or reach us at ${BRAND.SUPPORT_EMAIL}.`;
  try {
    const sendEmail = await mail();
    await sendEmail({
      to:      p.email,
      subject: `We received your appointment request — ${BRAND.NAME}`,
      html: `
        <p>Hi ${escapeHtml(p.patientName)},</p>
        <p>Thank you for choosing ${BRAND.NAME}. We've received your request for
        <strong>${p.preferredDate}</strong> (${timeLabel}) and will confirm within a few hours.</p>
        <p>${callLine}</p>
        <p>— ${BRAND.NAME}, ${BRAND.CITY}</p>`,
    });
  } catch (err) {
    logger.warn("[Notify] received-email failed (non-blocking)", { err: String(err) });
  }
}

interface ConfirmedPayload {
  patientName: string; email: string; phone: string;
  confirmedDate: string; confirmedTime: string;
}

/** Sent when an admin approves the appointment with a confirmed date/time. */
export async function notifyAppointmentConfirmed(p: ConfirmedPayload): Promise<void> {
  const { phone, address } = await getClinicContact();
  const contactLine = phone ? `Questions? Call ${phone}.` : `Questions? Reach us at ${BRAND.SUPPORT_EMAIL}.`;
  // Email confirmation
  try {
    const sendEmail = await mail();
    await sendEmail({
      to:      p.email,
      subject: `Appointment confirmed — ${BRAND.NAME}`,
      html: `
        <p>Hi ${escapeHtml(p.patientName)},</p>
        <p>Your appointment at ${BRAND.NAME} is <strong>confirmed</strong> for:</p>
        <p style="font-size:18px"><strong>${p.confirmedDate} at ${p.confirmedTime}</strong></p>
        <p>Address: ${escapeHtml(address)}<br/>${contactLine}</p>
        <p>— ${BRAND.NAME}</p>`,
    });
  } catch (err) {
    logger.warn("[Notify] confirm-email failed (non-blocking)", { err: String(err) });
  }

  // WhatsApp confirmation (no-ops safely until a provider is configured)
  try {
    const sendWhatsApp = await wa();
    await sendWhatsApp({
      to:   p.phone,
      body: `Hi ${p.patientName}, your appointment at ${BRAND.NAME} is confirmed for ${p.confirmedDate} at ${p.confirmedTime}. Address: ${address}. See you soon!`,
      template: {
        name: process.env.WHATSAPP_CONFIRM_TEMPLATE ?? "appointment_confirmed",
        params: [p.patientName, p.confirmedDate, p.confirmedTime],
      },
    });
  } catch (err) {
    logger.warn("[Notify] confirm-whatsapp failed (non-blocking)", { err: String(err) });
  }
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, ch =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch] as string));
}
