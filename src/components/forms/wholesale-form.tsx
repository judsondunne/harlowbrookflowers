"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormTiming } from "./use-form-timing";
import Link from "next/link";
import Script from "next/script";
import { wholesaleInquiryAction, type FormState } from "@/app/actions/forms";
import { WHOLESALE_BUSINESS_TYPES, WHOLESALE_USES } from "@/content/wholesale";
import { Button, ButtonLink } from "@/components/ui/button";
import { SelectField, TextArea, TextField } from "@/components/ui/field";

/** `previewNotice`: say plainly that a disposable preview deployment won't keep the inquiry. */
export function WholesaleForm({ previewNotice = false }: { previewNotice?: boolean }) {
  const [state, action, pending] = useActionState<FormState, FormData>(wholesaleInquiryAction, { status: "idle" });
  const timing = useFormTiming();
  const statusRef = useRef<HTMLDivElement>(null);
  const turnstileKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (state.status !== "idle") statusRef.current?.focus();
  }, [state]);

  if (state.status === "success") {
    return (
      <div ref={statusRef} tabIndex={-1} role="status" className="border-t border-ink pt-8 outline-none">
        <p className="t-h2">Thank you.</p>
        <p className="mt-4 max-w-md text-[1.0625rem] leading-relaxed text-ink-soft">{state.message}</p>
        <p className="mt-3 max-w-md text-[0.9375rem] leading-relaxed text-ink-soft">
          If anything comes to mind in the meantime, simply reply to her email when it arrives.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3">
          <ButtonLink href="/about" variant="secondary">
            About the farm
          </ButtonLink>
          <Link href="/shop" className="link-rule">
            See this week&apos;s bouquets
          </Link>
        </div>
      </div>
    );
  }

  const v = state.values ?? {};
  const e = state.fieldErrors ?? {};
  return (
    <form action={action} onSubmit={timing.onSubmit} noValidate className="space-y-5" aria-describedby="w-required-note">
      <input type="hidden" name="startedAt" defaultValue="0" />
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Leave this empty <input type="text" name="hb_extra" tabIndex={-1} autoComplete="off" />
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
        <TextField
          id="w-contactName"
          name="contactName"
          label="Your name"
          autoComplete="name"
          required
          maxLength={100}
          defaultValue={v.contactName}
          error={e.contactName}
        />
        <TextField
          id="w-businessName"
          name="businessName"
          label="Business name"
          autoComplete="organization"
          required
          maxLength={120}
          defaultValue={v.businessName}
          error={e.businessName}
        />
        <TextField
          id="w-email"
          name="email"
          type="email"
          label="Email"
          autoComplete="email"
          required
          maxLength={254}
          defaultValue={v.email}
          error={e.email}
        />
        <TextField
          id="w-phone"
          name="phone"
          type="tel"
          label="Phone"
          optional
          autoComplete="tel"
          maxLength={40}
          defaultValue={v.phone}
          error={e.phone}
        />
        <SelectField
          id="w-businessType"
          name="businessType"
          label="Type of business"
          required
          defaultValue={v.businessType ?? ""}
          error={e.businessType}
        >
          <option value="" disabled>
            Choose the closest match
          </option>
          {WHOLESALE_BUSINESS_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </SelectField>
        <TextField
          id="w-location"
          name="location"
          label="Town or city"
          autoComplete="address-level2"
          required
          maxLength={120}
          placeholder="e.g. Woodstock, VT"
          defaultValue={v.location}
          error={e.location}
        />
        <SelectField
          id="w-intendedUse"
          name="intendedUse"
          label="How you'd use the flowers"
          optional
          defaultValue={v.intendedUse ?? ""}
          error={e.intendedUse}
        >
          <option value="">Choose one</option>
          {WHOLESALE_USES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </SelectField>
        <TextField
          id="w-startDate"
          name="startDate"
          label="When you'd like to start"
          optional
          maxLength={80}
          placeholder="e.g. June 2027"
          defaultValue={v.startDate}
          error={e.startDate}
        />
      </div>
      <TextField
        id="w-quantity"
        name="quantity"
        label="Rough quantity and how often"
        optional
        maxLength={300}
        placeholder="e.g. 12 wrapped bouquets every Friday, or a few buckets for a weekend"
        defaultValue={v.quantity}
        error={e.quantity}
      />
      <TextArea
        id="w-details"
        name="details"
        label="Anything else we should know"
        optional
        rows={5}
        maxLength={3000}
        defaultValue={v.details}
        error={e.details}
        placeholder="Colors you love, the look of your shop, an event date…"
      />

      {previewNotice && (
        <p className="border-l-2 border-olive bg-butter/50 px-4 py-3 text-[0.8125rem] leading-relaxed text-ink-soft">
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
        <p id="w-required-note" className="text-xs leading-relaxed text-muted sm:max-w-xs">
          Fields not marked optional are required. We use your details only to reply about wholesale flowers. See our{" "}
          <a href="/privacy" className="underline underline-offset-2">
            privacy policy
          </a>
          .
        </p>
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Sending…" : "Send inquiry"}
        </Button>
      </div>
    </form>
  );
}
