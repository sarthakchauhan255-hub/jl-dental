import { Resend } from "resend";
import { env } from "@/env";

/**
 * Resend client — server-side only, LAZILY constructed.
 * Module-scope construction breaks `next build` page-data collection when the
 * key is absent; lazy init also lets unconfigured environments no-op safely.
 * Abstracted so the provider can be swapped without touching call sites.
 */
let _resend: Resend | null = null;
function getClient(): Resend | null {
  if (!env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(env.RESEND_API_KEY);
  return _resend;
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

export interface EmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

/**
 * Send an email via Resend.
 * All email sends go through this abstraction layer.
 */
export async function sendEmail(options: SendEmailOptions): Promise<EmailResult> {
  const resend = getClient();
  if (!resend) {
    console.info("[Email] RESEND_API_KEY not configured — email not sent (noop)");
    return { success: false, error: "no_provider_configured" };
  }
  try {
    const { data, error } = await resend.emails.send({
      from: env.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
      replyTo: options.replyTo,
    });

    if (error) {
      console.error("[Email] Send failed:", error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown email error";
    console.error("[Email] Unexpected error:", message);
    return { success: false, error: message };
  }
}

