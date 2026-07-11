"use client";
import { useState, type FormEvent } from "react";
import { useRouter }                from "next/navigation";
import { Eye, EyeOff }              from "lucide-react";
import { Button }                   from "@/components/ui/button";
import { Input }                    from "@/components/ui/input";
import { Label }                    from "@/components/ui/label";
import { cn }                       from "@/lib/utils";
import { BRAND } from "@/config/branding";

export function LoginForm({ redirectTo = "/admin/dashboard" }: { redirectTo?: string }) {
  const router = useRouter();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch("/api/auth/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: email.trim(), password }),
      });
      const json = await res.json() as { success: boolean; error?: string };
      if (!json.success) {
        setError(json.error ?? "Sign in failed. Please try again.");
        return;
      }
      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Sign in" className="space-y-5">
      {error && (
        <div role="alert" aria-live="assertive"
          className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email" type="email" autoComplete="email" required
          value={email} onChange={(e) => setEmail(e.target.value)}
          {...{placeholder: BRAND.SUPPORT_EMAIL}} disabled={loading}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password" type={showPwd ? "text" : "password"}
            autoComplete="current-password" required
            value={password} onChange={(e) => setPassword(e.target.value)}
            disabled={loading} className="pr-10"
          />
          <button
            type="button" tabIndex={-1}
            aria-label={showPwd ? "Hide password" : "Show password"}
            onClick={() => setShowPwd((v) => !v)}
            className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400",
              "hover:text-charcoal-600 transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 rounded"
            )}
          >
            {showPwd
              ? <EyeOff className="h-4 w-4" aria-hidden="true" />
              : <Eye    className="h-4 w-4" aria-hidden="true" />
            }
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <a href="/admin/forgot-password"
          className="text-xs text-primary-600 hover:text-primary-700 hover:underline transition-colors">
          Forgot your password?
        </a>
      </div>

      <Button type="submit" size="lg" disabled={loading || !email || !password} className="w-full">
        {loading ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
