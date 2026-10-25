"use server";

import { z } from "zod";
import { db, schema } from "@/server/db/client";
import { clientFingerprint, rateLimit } from "@/server/rate-limit";
import { loadSettings } from "@/server/settings";
import { disposableStorage } from "@/server/config";
import { sendEmail } from "@/server/email";
import { site } from "@/lib/site";
import { CONTACT_TOPICS, NEWSLETTER_CONSENT } from "@/content/forms";
import { WHOLESALE_FIELDS, wholesaleInquirySchema } from "@/domain/wholesale";

export type FormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
};

const contactSchema = z.object({
  name: z.string().trim().min(2, "Please tell us your name.").max(100),
  email: z.string().trim().toLowerCase().email("Enter a valid email address.").max(254),
  topic: z.enum(CONTACT_TOPICS, { message: "Choose a topic." }),
  message: z.string().trim().min(10, "A few more words, please (at least 10 characters).").max(3000),
});

async function verifyTurnstile(token: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: new URLSearchParams({ secret, response: token }),
  });
  const data = (await res.json().catch(() => ({}))) as { success?: boolean };
  return data.success === true;
}

/*
 * Spam defence: honeypot field, minimum fill time, optional Turnstile, and per-client rate limiting.
 * The timing check runs after validation, so a person who submits an incomplete form too quickly still sees
 * what's missing; only complete submissions sent faster than a person could type are quietly dropped.
 */
function honeypotFilled(formData: FormData, honeypot = "company") {
  return String(formData.get(honeypot) ?? "") !== "";
}
function sentTooFast(formData: FormData) {
  const started = Number(formData.get("startedAt") ?? 0);
  return !started || Date.now() - started < 2500;
}

export async function contactAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    topic: String(formData.get("topic") ?? ""),
    message: String(formData.get("message") ?? ""),
  };
  // Quietly accept bot submissions without storing them.
  const botReply: FormState = { status: "success", message: "Thank you, your message is on its way." };
  if (honeypotFilled(formData)) return botReply;

  const parsed = contactSchema.safeParse(values);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors, values };
  }
  if (sentTooFast(formData)) return botReply;
  if (!(await verifyTurnstile(String(formData.get("cf-turnstile-response") ?? "")))) {
    return { status: "error", message: "We couldn't verify the form. Please try again.", values };
  }
  const limit = await rateLimit(`contact:${await clientFingerprint()}`, 5, 3600);
  if (!limit.ok) {
    return { status: "error", message: "You've sent several messages recently. Please try again a little later.", values };
  }

  await db.insert(schema.contactMessages).values({ id: crypto.randomUUID(), ...parsed.data });
  const settings = await loadSettings();
  const notify = settings.orderNotificationEmail || process.env.ORDER_NOTIFICATION_EMAIL;
  if (notify) {
    await sendEmail({
      to: notify,
      replyTo: parsed.data.email,
      subject: `Website message: ${parsed.data.topic} — ${parsed.data.name}`,
      text: `${parsed.data.name} <${parsed.data.email}>\nTopic: ${parsed.data.topic}\n\n${parsed.data.message}`,
    });
  }
  return { status: "success", message: "Thank you. Sarah reads every message and will reply as soon as she can." };
}

const newsletterSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address.").max(254),
  source: z.string().max(40).default("site"),
});

export async function newsletterAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = { email: String(formData.get("email") ?? "") };
  const botReply: FormState = { status: "success", message: "You're on the list." };
  if (honeypotFilled(formData)) return botReply;
  const parsed = newsletterSchema.safeParse({ email: values.email, source: String(formData.get("source") ?? "site") });
  if (!parsed.success) return { status: "error", fieldErrors: { email: parsed.error.issues[0].message }, values };
  if (formData.get("consent") !== "on") {
    return { status: "error", message: "Please tick the box to confirm you'd like our emails.", values };
  }
  if (sentTooFast(formData)) return botReply;
  const limit = await rateLimit(`newsletter:${await clientFingerprint()}`, 8, 3600);
  if (!limit.ok) return { status: "error", message: "Please try again a little later.", values };

  await db
    .insert(schema.subscribers)
    .values({
      id: crypto.randomUUID(),
      email: parsed.data.email,
      source: parsed.data.source,
      consentText: NEWSLETTER_CONSENT,
      unsubscribeToken: crypto.randomUUID(),
    })
    .onConflictDoUpdate({
      target: schema.subscribers.email,
      set: { unsubscribedAt: null, consentText: NEWSLETTER_CONSENT, consentedAt: new Date().toISOString() },
    });
  return {
    status: "success",
    message: disposableStorage()
      ? "Thank you. (This is a preview of the site, so sign-ups aren't kept yet.)"
      : `Thank you. We'll write from ${site.location.locality} when pickups open.`,
  };
}

/** Wholesale inquiry: stored for /admin/wholesale and, when a notification address is set, emailed to Sarah. */
export async function wholesaleInquiryAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = Object.fromEntries(WHOLESALE_FIELDS.map((k) => [k, String(formData.get(k) ?? "")]));
  // The business name is a real field here, so the honeypot uses a name browsers won't autofill.
  const botReply: FormState = { status: "success", message: "Thank you. Your inquiry is on its way to Sarah." };
  if (honeypotFilled(formData, "hb_extra")) return botReply;

  const parsed = wholesaleInquirySchema.safeParse(values);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors, values };
  }
  if (sentTooFast(formData)) return botReply;
  if (!(await verifyTurnstile(String(formData.get("cf-turnstile-response") ?? "")))) {
    return { status: "error", message: "We couldn't verify the form. Please try again.", values };
  }
  const limit = await rateLimit(`wholesale:${await clientFingerprint()}`, 4, 3600);
  if (!limit.ok) {
    return { status: "error", message: "You've sent a few inquiries recently. Please try again a little later, or email us.", values };
  }

  const data = parsed.data;
  await db.insert(schema.wholesaleInquiries).values({ id: crypto.randomUUID(), ...data });
  const settings = await loadSettings();
  const notify = settings.orderNotificationEmail || process.env.ORDER_NOTIFICATION_EMAIL;
  if (notify) {
    const lines = [
      `${data.contactName} <${data.email}>${data.phone ? ` · ${data.phone}` : ""}`,
      `${data.businessName} · ${data.businessType} · ${data.location}`,
      data.intendedUse && `Use: ${data.intendedUse}`,
      data.quantity && `Quantity / frequency: ${data.quantity}`,
      data.startDate && `Start: ${data.startDate}`,
      data.details && `\n${data.details}`,
    ].filter(Boolean);
    await sendEmail({
      to: notify,
      replyTo: data.email,
      subject: `Wholesale inquiry: ${data.businessName} (${data.businessType})`,
      text: lines.join("\n"),
    });
  }
  const first = data.contactName.split(/\s+/)[0];
  return {
    status: "success",
    message: `Thank you, ${first}. Your inquiry is with Sarah, and she'll reply to ${data.email}.`,
  };
}
