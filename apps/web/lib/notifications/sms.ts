/**
 * SMS notification service — stub for v1.
 * Architecture ready for Twilio SMS, MSG91, or any SMS provider.
 */

export interface SmsMessage {
  to: string;
  body: string;
}

export interface SmsResult {
  success: boolean;
  id?: string;
  error?: string;
}

export async function sendSms(message: SmsMessage): Promise<SmsResult> {
  // V1 stub
  console.log("[SMS STUB] Would send to:", message.to, "| Body:", message.body);
  return { success: true, id: "stub" };
}
