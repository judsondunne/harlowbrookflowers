"use client";

import { useActionState, useEffect, useRef } from "react";
import { newsletterAction, type FormState } from "@/app/actions/forms";
import { NEWSLETTER_CONSENT } from "@/content/forms";
import { IconArrowRight, IconCheck } from "@/components/ui/icons";
import { cn } from "@/lib/format";

/** Email capture with explicit, recorded consent. */
export function NewsletterForm({ source, tone = "light" }: { source: string; tone?: "light" | "dark" }) {
  const [state, action, pending] = useActionState<FormState, FormData>(newsletterAction, { status: "idle" });
  const startedRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (startedRef.current) startedRef.current.value = String(Date.now());
  }, []);
  const dark = tone === "dark";
  const id = `nl-${source}`;

  if (state.status === "success") {
    return (
      <p role="status" className={cn("flex items-center gap-2 text-sm", dark ? "text-paper" : "text-ink")}>
        <span className={cn("grid size-6 place-items-center rounded-full", dark ? "bg-paper text-ink" : "bg-ink text-paper")}>
          <IconCheck size={14} strokeWidth={2} />
        </span>
        {state.message}
      </p>
    );
  }

  return (
    <form action={action} noValidate className="w-full">
      <input type="hidden" name="source" value={source} />
      <input ref={startedRef} type="hidden" name="startedAt" defaultValue="0" />
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Company <input type="text" name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label htmlFor={`${id}-email`} className="sr-only">
        Email address
      </label>
      <div
        className={cn(
          "flex items-center rounded-full border p-1 pl-5 transition-colors focus-within:border-current",
          dark ? "border-paper/30 bg-paper/5 text-paper" : "border-ink/25 bg-paper text-ink",
        )}
      >
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={state.values?.email}
          placeholder="Your email address"
          aria-invalid={!!state.fieldErrors?.email}
          aria-describedby={`${id}-msg`}
          className={cn("min-w-0 flex-1 bg-transparent py-2 text-sm outline-none", dark ? "placeholder:text-paper/50" : "placeholder:text-muted")}
        />
        <button
          type="submit"
          disabled={pending}
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-full transition-colors disabled:opacity-50",
            dark ? "bg-paper text-ink hover:bg-white" : "bg-ink text-paper hover:bg-ink-soft",
          )}
          aria-label="Join the list"
        >
          <IconArrowRight size={18} />
        </button>
      </div>
      <label className={cn("mt-3 flex items-start gap-2.5 text-xs leading-relaxed", dark ? "text-paper/70" : "text-muted")}>
        <input type="checkbox" name="consent" required className="mt-0.5 size-4 shrink-0 accent-current" />
        <span>{NEWSLETTER_CONSENT}</span>
      </label>
      <p id={`${id}-msg`} role={state.status === "error" ? "alert" : undefined} className={cn("mt-2 text-xs", dark ? "text-butter" : "text-error")}>
        {state.fieldErrors?.email ?? (state.status === "error" ? state.message : "")}
      </p>
    </form>
  );
}
