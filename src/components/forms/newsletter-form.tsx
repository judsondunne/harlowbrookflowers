"use client";

import { useActionState } from "react";
import { useFormTiming } from "./use-form-timing";
import { newsletterAction, type FormState } from "@/app/actions/forms";
import { NEWSLETTER_CONSENT } from "@/content/forms";
import { IconCheck } from "@/components/ui/icons";
import { cn } from "@/lib/format";

/** Email capture with explicit, recorded consent. */
export function NewsletterForm({ source, tone = "light" }: { source: string; tone?: "light" | "dark" }) {
  const [state, action, pending] = useActionState<FormState, FormData>(newsletterAction, { status: "idle" });
  const timing = useFormTiming();
  const dark = tone === "dark";
  const id = `nl-${source}`;

  if (state.status === "success") {
    return (
      <p role="status" className={cn("flex items-center gap-2 text-sm", dark ? "text-paper" : "text-ink")}>
        <IconCheck size={18} strokeWidth={1.5} className={dark ? "text-paper" : "text-ink"} />
        {state.message}
      </p>
    );
  }

  return (
    <form action={action} onSubmit={timing.onSubmit} noValidate className="w-full">
      <input type="hidden" name="source" value={source} />
      <input type="hidden" name="startedAt" defaultValue="0" />
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
          "flex h-12 items-stretch rounded-[2px] border pl-4 transition-colors focus-within:border-current",
          dark ? "border-paper/30 bg-paper/5 text-paper" : "border-line-strong bg-paper text-ink",
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
          className={cn("min-w-0 flex-1 bg-transparent text-[0.9375rem] outline-none", dark ? "placeholder:text-paper/50" : "placeholder:text-muted")}
        />
        <button
          type="submit"
          disabled={pending}
          className={cn(
            "shrink-0 px-5 text-[0.875rem] font-medium transition-colors disabled:opacity-50",
            dark ? "text-paper hover:bg-paper/10" : "text-ink hover:bg-ink/[0.045]",
          )}
        >
          {pending ? "Signing up…" : "Sign up"}
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
