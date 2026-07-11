"use client";
import { Check, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type SaveState = "idle" | "saving" | "saved" | "error";

interface SaveIndicatorProps {
  state:    SaveState;
  className?: string;
}

export function SaveIndicator({ state, className }: SaveIndicatorProps) {
  if (state === "idle") return null;
  return (
    <div className={cn("flex items-center gap-1.5 text-xs", className)}>
      {state === "saving" && (
        <><Loader2 className="h-3.5 w-3.5 animate-spin text-charcoal-400" aria-hidden="true" /><span className="text-charcoal-400">Saving…</span></>
      )}
      {state === "saved" && (
        <><Check className="h-3.5 w-3.5 text-green-600" aria-hidden="true" /><span className="text-green-600">Saved</span></>
      )}
      {state === "error" && (
        <><AlertCircle className="h-3.5 w-3.5 text-destructive" aria-hidden="true" /><span className="text-destructive">Save failed</span></>
      )}
    </div>
  );
}
