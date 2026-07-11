import type { Metadata }  from "next";
import { redirect }       from "next/navigation";
import { getSession }     from "@/lib/auth/session";
import { LoginForm }      from "@/features/auth/components/login-form";
import { getBrandAssets, BRAND } from "@/config/branding";

export const metadata: Metadata = {
  title: "Sign In | JL Dental Admin",
  robots: { index: false, follow: false },
};

const brand = getBrandAssets();

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; reset?: string }>;
}) {
  const session = await getSession();
  if (session) redirect("/admin/dashboard");

  const params = await searchParams;
  const redirectTo = params.from?.startsWith("/admin") ? params.from : "/admin/dashboard";

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="h-1 w-full bg-gradient-to-r from-primary-800 via-primary-600 to-primary-800" aria-hidden="true" />

      <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
        <div className="mb-10 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-700 shadow-md">
            <span className="text-xl font-bold text-white tracking-tight">{brand.monogram}</span>
          </div>
          <div className="text-center">
            <p className="font-display text-2xl font-semibold tracking-tight text-charcoal-900">
              {brand.name}
            </p>
            <p className="mt-0.5 text-sm text-charcoal-400">Admin Portal</p>
          </div>
        </div>

        <div className="w-full max-w-sm">
          <div className="rounded-2xl border border-charcoal-100 bg-white p-8 shadow-luxury">
            <div className="mb-6">
              <h1 className="font-display text-xl font-semibold tracking-tight text-charcoal-900">
                Welcome back
              </h1>
              <p className="mt-1 text-sm text-charcoal-400">Sign in to continue</p>
            </div>

            {params.reset === "success" && (
              <div role="status" className="mb-5 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
                Password updated. Please sign in with your new password.
              </div>
            )}

            <LoginForm redirectTo={redirectTo} />
          </div>
        </div>

        <p className="mt-8 text-xs text-charcoal-300">
          {brand.name} — Solan, Himachal Pradesh
        </p>
      </div>
    </div>
  );
}
