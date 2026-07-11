/**
 * WhatsApp notification service — provider-agnostic, zero SDK dependencies.
 *
 * PROVIDERS (checked in order):
 *  1. Meta WhatsApp Cloud API — set WHATSAPP_ACCESS_TOKEN + WHATSAPP_PHONE_NUMBER_ID.
 *     Business-initiated messages REQUIRE a Meta-approved template; pass `template`.
 *     Free tier (1,000 conversations/month) far exceeds a single clinic's volume.
 *  2. Twilio WhatsApp — set TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN + TWILIO_WHATSAPP_FROM.
 *     Freeform `body` allowed inside the 24h session window; template otherwise.
 *  3. Neither configured → logs intent (no PII) and returns success:false, sid:"noop".
 *
 * Callers treat this as fire-and-forget; failures are logged, never thrown.
 */
import { env }    from "@/env";
import { logger } from "@/lib/logger";

export interface WhatsAppTemplate {
  name:   string;
  params: string[];
  lang?:  string;
}

export interface WhatsAppMessage {
  to:        string;             // E.164, e.g. +919876543210
  body:      string;             // freeform fallback text
  template?: WhatsAppTemplate;   // required for Meta business-initiated sends
}

export interface WhatsAppResult {
  success:  boolean;
  provider: "meta" | "twilio" | "noop";
  sid?:     string;
  error?:   string;
}

function normalizeE164(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  return digits.startsWith("+") ? digits : `+${digits}`;
}

export async function sendWhatsApp(message: WhatsAppMessage): Promise<WhatsAppResult> {
  const to = normalizeE164(message.to);

  // ── Provider 1: Meta Cloud API ────────────────────────────────────────────
  const metaToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const metaPhone = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (metaToken && metaPhone) {
    try {
      const payload = message.template
        ? {
            messaging_product: "whatsapp", to, type: "template",
            template: {
              name: message.template.name,
              language: { code: message.template.lang ?? "en" },
              components: [{
                type: "body",
                parameters: message.template.params.map(p => ({ type: "text", text: p })),
              }],
            },
          }
        : { messaging_product: "whatsapp", to, type: "text", text: { body: message.body } };

      const res = await fetch(
        `https://graph.facebook.com/v20.0/${metaPhone}/messages`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${metaToken}`, "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const json = await res.json() as { messages?: { id: string }[]; error?: { message: string } };
      if (!res.ok || json.error) {
        logger.warn("[WhatsApp] Meta send failed", { status: res.status, error: json.error?.message });
        return { success: false, provider: "meta", error: json.error?.message ?? `HTTP ${res.status}` };
      }
      return { success: true, provider: "meta", sid: json.messages?.[0]?.id };
    } catch (err) {
      logger.warn("[WhatsApp] Meta request error", { err: String(err) });
      return { success: false, provider: "meta", error: String(err) };
    }
  }

  // ── Provider 2: Twilio ────────────────────────────────────────────────────
  const sid   = env.TWILIO_ACCOUNT_SID;
  const token = env.TWILIO_AUTH_TOKEN;
  const from  = env.TWILIO_WHATSAPP_FROM;
  if (sid && token && from) {
    try {
      const form = new URLSearchParams({
        From: `whatsapp:${normalizeE164(from)}`,
        To:   `whatsapp:${to}`,
        Body: message.body,
      });
      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: "Basic " + Buffer.from(`${sid}:${token}`).toString("base64"),
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: form,
        },
      );
      const json = await res.json() as { sid?: string; message?: string };
      if (!res.ok) {
        logger.warn("[WhatsApp] Twilio send failed", { status: res.status, error: json.message });
        return { success: false, provider: "twilio", error: json.message ?? `HTTP ${res.status}` };
      }
      return { success: true, provider: "twilio", sid: json.sid };
    } catch (err) {
      logger.warn("[WhatsApp] Twilio request error", { err: String(err) });
      return { success: false, provider: "twilio", error: String(err) };
    }
  }

  // ── No provider configured — safe no-op ───────────────────────────────────
  logger.info("[WhatsApp] No provider configured — message not sent (noop)");
  return { success: false, provider: "noop", error: "no_provider_configured" };
}
