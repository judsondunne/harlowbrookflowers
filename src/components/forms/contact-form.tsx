"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormTiming } from "./use-form-timing";
import Script from "next/script";
import { contactAction, type FormState } from "@/app/actions/forms";
import { CONTACT_TOPICS } from "@/content/forms";
import { Button } from "@/components/ui/button";
import { SelectField, TextArea, TextField } from "@/components/ui/field";

export function ContactForm({ previewNotice = false }: { previewNotice?: boolean }) {
  const [state, action, pending] = useActionState<FormState, FormData>(contactAction, { status: "idle" });
  const timing = useFormTiming();
  const statusRef = useRef<HTMLDivElement>(null);
  const turnstileKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (state.status !== "idle") statusRef.current?.focus();
  }, [state]);

  if (state.status === "success") {
    return (
      <div ref={statusRef} tabIndex={-1} role="status" className="border-t border-ink pt-8 outline-none">
        <p className="t-h2">Message sent.</p>
        <p className="mt-3 text-ink-soft">{state.message}</p>
      </div>
    );
  }

  const v = state.values ?? {};
  const e = state.fieldErrors ?? {};
  return (
    <form action={action} onSubmit={timing.onSubmit} noValidate className="space-y-5">
      <input type="hidden" name="startedAt" defaultValue="0" />
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Company <input type="text" name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div ref={statusRef} tabIndex={-1} className="outline-none">
        {state.status === "error" && state.message && (
          <p role="alert" className="border-l-2 border-error bg-error/5 px-4 py-3 text-sm font-medium text-error">
            {state.message}
          </p>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField id="c-name" name="name" label="Your name" autoComplete="name" required defaultValue={v.name} error={e.name} />
        <TextField
          id="c-email"
          name="email"
          type="email"
          label="Email"
          autoComplete="email"
          required
          defaultValue={v.email}
          error={e.email}
        />
      </div>
      <SelectField id="c-topic" name="topic" label="What's it about?" defaultValue={v.topic ?? ""} error={e.topic} required>
        <option value="" disabled>
          Choose a topic
        </option>
        {CONTACT_TOPICS.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </SelectField>
      <TextArea id="c-message" name="message" label="Message" rows={6} maxLength={3000} required defaultValue={v.message} error={e.message} />

      {previewNotice && (
        <p className="border-l-2 border-ink/30 bg-butter/50 px-4 py-3 text-[0.8125rem] leading-relaxed text-ink-soft">
          This is a preview of the site, so messages sent from it aren&apos;t kept yet.
        </p>
      )}
      {turnstileKey && (
        <>
          <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
          <div className="cf-turnstile" data-sitekey={turnstileKey} data-theme="light" />
        </>
      )}

      <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted sm:max-w-xs">
          We use your details only to reply to you. See our{" "}
          <a href="/privacy" className="underline underline-offset-2">
            privacy policy
          </a>
          .
        </p>
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Sending…" : "Send message"}
        </Button>
      </div>
    </form>
  );
}
