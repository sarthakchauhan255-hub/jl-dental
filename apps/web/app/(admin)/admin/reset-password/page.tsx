import type { Metadata }          from "next";
import { ResetPasswordForm }      from "@/features/auth/components/reset-password-form";
import { getBrandAssets, BRAND } from "@/config/branding";

export const metadata: Metadata = {
  title: "Set New Password | JL Dental Admin",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; uid?: string }>;
}) {
  const { token, uid } = await searchParams;

  if (!token || !uid) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4 text-center">
        <div>
          <p className="text-sm text-charcoal-600">Invalid or expired reset link.</p>
          <a href="/admin/forgot-password" className="mt-3 block text-sm text-primary-600 hover:underline">
            Request a new link
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="h-1 w-full bg-gradient-to-r from-primary-800 via-primary-600 to-primary-800" aria-hidden="true" />
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
        <div className="mb-10 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-700 shadow-md">
            <span className="text-xl font-bold text-white">{getBrandAssets().monogram}</span>
          </div>
          <p className="font-display text-xl font-semibold tracking-tight text-charcoal-900">
            Set new password
          </p>
        </div>
        <div className="w-full max-w-sm">
          <div className="rounded-2xl border border-charcoal-100 bg-white p-8 shadow-luxury">
            <ResetPasswordForm token={token} uid={uid} />
          </div>
        </div>
      </div>
    </div>
  );
}
