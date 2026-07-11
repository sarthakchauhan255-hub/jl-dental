"use client";
import { useState, type FormEvent } from "react";
import { useRouter }                from "next/navigation";
import { Button }                   from "@/components/ui/button";
import { Input }                    from "@/components/ui/input";
import { Label }                    from "@/components/ui/label";

export function ResetPasswordForm({ token, uid }: { token: string; uid: string }) {
  const router = useRouter();
  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (password.length < 8)  { setError("Minimum 8 characters required."); return; }
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch("/api/auth/reset-password", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ token, password }),
      });
      const json = await res.json() as { success: boolean; error?: string };
      if (!json.success) { setError(json.error ?? "Reset failed."); return; }
      router.push("/admin/login?reset=success");
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {error && (
        <div role="alert" className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="new-password">New password</Label>
        <Input
          id="new-password" type="password" autoComplete="new-password"
          required minLength={8} value={password}
          onChange={(e) => setPassword(e.target.value)} disabled={loading}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirm-password">Confirm password</Label>
        <Input
          id="confirm-password" type="password" autoComplete="new-password"
          required value={confirm}
          onChange={(e) => setConfirm(e.target.value)} disabled={loading}
        />
      </div>
      <Button type="submit" size="lg" disabled={loading || !password || !confirm} className="w-full">
        {loading ? "Updating…" : "Set new password"}
      </Button>
    </form>
  );
}
