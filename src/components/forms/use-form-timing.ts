"use client";

import { useEffect, useRef, type FormEvent } from "react";

/**
 * Feeds the spam check's "time started" field. React resets a form after each action, so the field is
 * stamped at submit time from the moment the form mounted; a resubmission after fixing errors still counts.
 * Render `<input type="hidden" name="startedAt" defaultValue="0" />` and pass `onSubmit` to the form.
 */
export function useFormTiming() {
  const mountedAt = useRef(0);
  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);
  return {
    onSubmit(e: FormEvent<HTMLFormElement>) {
      const field = e.currentTarget.elements.namedItem("startedAt");
      if (field instanceof HTMLInputElement) field.value = String(mountedAt.current);
    },
  };
}
