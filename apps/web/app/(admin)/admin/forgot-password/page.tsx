import type { Metadata }           from "next";
import { ForgotPasswordForm }      from "@/features/auth/components/forgot-password-form";
import { getBrandAssets, BRAND } from "@/config/branding";

export const metadata: Metadata = {
  title: "Reset Password | JL Dental Admin",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="h-1 w-full bg-gradient-to-r from-primary-800 via-primary-600 to-primary-800" aria-hidden="true" />
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
        <div className="mb-10 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-700 shadow-md">
            <span className="text-xl font-bold text-white">{getBrandAssets().monogram}</span>
          </div>
          <p className="font-display text-xl font-semibold tracking-tight text-charcoal-900">
            Reset your password
          </p>
        </div>
        <div className="w-full max-w-sm">
          <div className="rounded-2xl border border-charcoal-100 bg-white p-8 shadow-luxury">
            <ForgotPasswordForm />
          </div>
        </div>
        <a href="/admin/login" className="mt-6 text-sm text-primary-600 hover:underline">
          ← Back to sign in
        </a>
      </div>
    </div>
  );
}
