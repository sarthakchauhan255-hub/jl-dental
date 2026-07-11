"use client";
import { useEffect } from "react";

/**
 * Warns the user before navigating away with unsaved changes.
 * Drop into any CMS form with a dirty state check.
 */
export function UnsavedWarning({ isDirty }: { isDirty: boolean }) {
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);
  return null;
}
