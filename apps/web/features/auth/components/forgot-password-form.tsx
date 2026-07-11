"use client";
import { useState, type FormEvent } from "react";
import { Button }  from "@/components/ui/button";
import { Input }   from "@/components/ui/input";
import { Label }   from "@/components/ui/label";
import { BRAND } from "@/config/branding";

export function ForgotPasswordForm() {
  const [email,     setEmail]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading || !email) return;
    setLoading(true);
    try {
      await fetch("/api/auth/reset-password", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: email.trim() }),
      });
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center space-y-3">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <span className="text-green-600 text-lg" aria-hidden="true">✓</span>
        </div>
        <p className="text-sm font-medium text-charcoal-700">Check your inbox</p>
        <p className="text-sm text-charcoal-500">
          If that email is registered, a reset link has been sent. It expires in 1 hour.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <p className="text-sm text-charcoal-500">
        Enter your email and we&apos;ll send a reset link.
      </p>
      <div className="space-y-1.5">
        <Label htmlFor="reset-email">Email address</Label>
        <Input
          id="reset-email" type="email" autoComplete="email" required
          value={email} onChange={(e) => setEmail(e.target.value)}
          {...{placeholder: BRAND.SUPPORT_EMAIL}} disabled={loading}
        />
      </div>
      <Button type="submit" size="lg" disabled={loading || !email} className="w-full">
        {loading ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}
