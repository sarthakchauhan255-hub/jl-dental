/**
 * Notifications domain barrel.
 * Email via Resend. WhatsApp via Twilio (stub in v1). SMS stub.
 */
export { sendEmail }       from "./email";
export { sendWhatsApp }    from "./whatsapp";
export { sendSms }         from "./sms";
export type { SendEmailOptions, EmailResult }       from "./email";
export type { WhatsAppMessage, WhatsAppResult }     from "./whatsapp";
export type { SmsMessage, SmsResult }               from "./sms";
