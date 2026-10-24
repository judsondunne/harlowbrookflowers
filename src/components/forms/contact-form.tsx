"use client";

import { useActionState, useEffect, useRef } from "react";
import Script from "next/script";
import { contactAction, type FormState } from "@/app/actions/forms";
import { CONTACT_TOPICS } from "@/content/forms";
import { Button } from "@/components/ui/button";
import { SelectField, TextArea, TextField } from "@/components/ui/field";
import { IconCheck } from "@/components/ui/icons";

export function ContactForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(contactAction, { status: "idle" });
  const startedRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const turnstileKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (startedRef.current) startedRef.current.value = String(Date.now());
  }, []);
  useEffect(() => {
    if (state.status !== "idle") statusRef.current?.focus();
  }, [state]);

  if (state.status === "success") {
    return (
      <div ref={statusRef} tabIndex={-1} role="status" className="bg-paper p-8 text-center ring-1 ring-line outline-none">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-ink text-paper">
          <IconCheck size={22} strokeWidth={1.75} />
        </span>
        <p className="mt-5 font-display text-3xl">Message sent.</p>
        <p className="mt-3 text-ink-soft">{state.message}</p>
      </div>
    );
  }

  const v = state.values ?? {};
  const e = state.fieldErrors ?? {};
  return (
    <form action={action} noValidate className="space-y-5">
      <input ref={startedRef} type="hidden" name="startedAt" defaultValue="0" />
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Company <input type="text" name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div ref={statusRef} tabIndex={-1} className="outline-none">
        {state.status === "error" && state.message && (
          <p role="alert" className="rounded-sm border border-error/40 bg-error/5 p-3 text-sm font-medium text-error">
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
        <Button type="submit" size="lg" disabled={pending} arrow={!pending}>
          {pending ? "Sending…" : "Send message"}
        </Button>
      </div>
    </form>
  );
}
