"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/components/cart/cart-provider";
import { cartStore } from "@/components/cart/cart-store";
import { Button } from "@/components/ui/button";
import { TextArea, TextField } from "@/components/ui/field";
import { IconCheck, SprigMark } from "@/components/ui/icons";
import { formatPrice, cn } from "@/lib/format";
import { addMonths, formatMonth } from "@/lib/time";

export type GiftPlan = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  priceCents: number;
  deliveries: number;
  startMonths: string[];
  available: boolean;
  remaining: number | null;
  image: { src: string; alt: string } | null;
};

type Errors = Partial<Record<"recipientName" | "senderName" | "recipientEmail" | "startMonth", string>>;

export function GiftBuilder({ plans }: { plans: GiftPlan[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const { open, announce } = useCart();
  const id = useId();
  const initial = plans.find((p) => p.slug === params.get("plan") && p.available) ?? plans.find((p) => p.available) ?? plans[0];

  const [planSlug, setPlanSlug] = useState(initial?.slug);
  const plan = plans.find((p) => p.slug === planSlug) ?? initial;
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [notifyRecipient, setNotifyRecipient] = useState(false);
  const [senderName, setSenderName] = useState("");
  const [message, setMessage] = useState("");
  const [startMonth, setStartMonth] = useState(initial?.startMonths[0] ?? "");
  const [errors, setErrors] = useState<Errors>({});

  if (!plan) return null;
  const month = plan.startMonths.includes(startMonth) ? startMonth : plan.startMonths[0];

  const validate = (): boolean => {
    const e: Errors = {};
    if (!recipientName.trim()) e.recipientName = "Add the recipient's name.";
    if (!senderName.trim()) e.senderName = "Add your name as it should appear on the card.";
    if (notifyRecipient && !/^\S+@\S+\.\S+$/.test(recipientEmail.trim())) e.recipientEmail = "Add their email so we can send the note.";
    if (!month) e.startMonth = "Choose a starting month.";
    setErrors(e);
    if (Object.keys(e).length) {
      document.getElementById(`${id}-${Object.keys(e)[0]}`)?.focus();
      return false;
    }
    return true;
  };

  const add = (thenCheckout: boolean) => {
    if (!validate()) return;
    cartStore.add({
      productId: plan.id,
      quantity: 1,
      gift: {
        recipientName: recipientName.trim(),
        recipientEmail: recipientEmail.trim() || undefined,
        senderName: senderName.trim(),
        message: message.trim(),
        startMonth: month,
        notifyRecipient: notifyRecipient && !!recipientEmail.trim(),
      },
    });
    announce(`${plan.name} for ${recipientName.trim()} added to your cart.`);
    if (thenCheckout) router.push("/checkout");
    else open();
  };

  const endMonth = month ? addMonths(month, plan.deliveries - 1) : "";

  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
      <div className="space-y-12 lg:col-span-7">
        <fieldset>
          <legend className="t-h3">
            <span className="mr-3 text-base font-sans font-semibold text-olive">01</span>Choose a plan
          </legend>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {plans.map((p) => {
              const selected = p.slug === plan.slug;
              return (
                <label
                  key={p.id}
                  className={cn(
                    "relative flex cursor-pointer flex-col bg-paper p-5 ring-1 transition",
                    selected ? "ring-2 ring-ink" : "ring-line hover:ring-ink/40",
                    !p.available && "cursor-not-allowed opacity-50",
                  )}
                >
                  <input
                    type="radio"
                    name={`${id}-plan`}
                    className="peer sr-only"
                    checked={selected}
                    disabled={!p.available}
                    onChange={() => {
                      setPlanSlug(p.slug);
                      setStartMonth(p.startMonths[0] ?? "");
                    }}
                  />
                  <span className="pointer-events-none absolute inset-0 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink" />
                  <span className="flex items-start justify-between gap-3">
                    <span className="font-display text-[1.4rem] leading-tight">{p.name}</span>
                    <span
                      className={cn(
                        "grid size-6 shrink-0 place-items-center rounded-full border",
                        selected ? "border-ink bg-ink text-paper" : "border-ink/30",
                      )}
                    >
                      {selected && <IconCheck size={14} strokeWidth={2} />}
                    </span>
                  </span>
                  <span className="mt-2 text-sm text-ink-soft">{p.tagline}</span>
                  <span className="mt-4 flex items-baseline gap-2">
                    <span className="text-xl font-semibold tabular-nums">{formatPrice(p.priceCents)}</span>
                    <span className="text-sm text-muted">
                      {p.deliveries} bouquets · {formatPrice(Math.round(p.priceCents / p.deliveries))} each
                    </span>
                  </span>
                  {!p.available && <span className="mt-2 text-xs font-semibold uppercase tracking-wider">Fully subscribed</span>}
                  {p.available && p.remaining !== null && p.remaining <= 5 && (
                    <span className="mt-2 text-xs font-semibold uppercase tracking-wider">Only {p.remaining} left this season</span>
                  )}
                </label>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="space-y-5">
          <legend className="t-h3 mb-2">
            <span className="mr-3 text-base font-sans font-semibold text-olive">02</span>Who is it for?
          </legend>
          <TextField
            id={`${id}-recipientName`}
            label="Recipient's name"
            value={recipientName}
            maxLength={80}
            autoComplete="off"
            onChange={(e) => setRecipientName(e.target.value)}
            error={errors.recipientName}
          />
          <TextField
            id={`${id}-recipientEmail`}
            type="email"
            label="Recipient's email"
            optional={!notifyRecipient}
            value={recipientEmail}
            maxLength={254}
            autoComplete="off"
            onChange={(e) => setRecipientEmail(e.target.value)}
            error={errors.recipientEmail}
            hint="So Sarah can share pickup dates with them directly."
          />
          <label className="flex cursor-pointer items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={notifyRecipient}
              onChange={(e) => setNotifyRecipient(e.target.checked)}
              className="mt-0.5 size-4 accent-[var(--color-ink)]"
            />
            <span className="text-ink-soft">
              Email them your note as soon as the gift is confirmed. Leave this off to keep it a surprise and give them
              the printable card yourself.
            </span>
          </label>
        </fieldset>

        <fieldset className="space-y-5">
          <legend className="t-h3 mb-2">
            <span className="mr-3 text-base font-sans font-semibold text-olive">03</span>Your note
          </legend>
          <TextField
            id={`${id}-senderName`}
            label="From"
            value={senderName}
            maxLength={80}
            autoComplete="name"
            onChange={(e) => setSenderName(e.target.value)}
            error={errors.senderName}
            placeholder="Your name"
          />
          <TextArea
            id={`${id}-message`}
            label="Message"
            optional
            rows={4}
            maxLength={500}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="A summer of flowers, because you deserve them."
            hint={`${message.length}/500`}
          />
        </fieldset>

        <fieldset>
          <legend className="t-h3">
            <span className="mr-3 text-base font-sans font-semibold text-olive">04</span>When should it begin?
          </legend>
          <div className="mt-5 flex flex-wrap gap-3" role="radiogroup" aria-describedby={errors.startMonth ? `${id}-sm-err` : undefined}>
            {plan.startMonths.map((m, i) => (
              <label key={m} className="cursor-pointer">
                <input
                  id={i === 0 ? `${id}-startMonth` : undefined}
                  type="radio"
                  name={`${id}-month`}
                  className="peer sr-only"
                  checked={month === m}
                  onChange={() => setStartMonth(m)}
                />
                <span className="inline-flex h-11 items-center rounded-full border border-ink/30 px-5 text-sm font-semibold transition peer-checked:border-ink peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink">
                  {formatMonth(m)}
                </span>
              </label>
            ))}
          </div>
          {errors.startMonth && (
            <p id={`${id}-sm-err`} className="mt-2 text-xs font-medium text-error">
              {errors.startMonth}
            </p>
          )}
          <p className="mt-4 text-sm text-muted">
            {plan.deliveries} monthly bouquets{month ? `, ${formatMonth(month)} to ${formatMonth(endMonth)}` : ""}. Bouquets
            follow the growing season and are collected in Hartland.
          </p>
        </fieldset>
      </div>

      <aside className="lg:col-span-5">
        <div className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
          <GiftCardPreview
            planName={plan.name}
            deliveries={plan.deliveries}
            month={month}
            endMonth={endMonth}
            recipient={recipientName}
            sender={senderName}
            message={message}
            image={plan.image}
          />
          <div className="mt-6 bg-paper p-6 ring-1 ring-line">
            <p className="flex items-baseline justify-between">
              <span className="font-semibold">{plan.name}</span>
              <span className="text-xl font-semibold tabular-nums">{formatPrice(plan.priceCents)}</span>
            </p>
            <p className="mt-1 text-sm text-muted">One payment. No renewals, no account.</p>
            <div className="mt-5 grid gap-3">
              <Button size="lg" onClick={() => add(true)} disabled={!plan.available}>
                Give this gift · checkout
              </Button>
              <Button variant="secondary" onClick={() => add(false)} disabled={!plan.available}>
                Add to cart and keep shopping
              </Button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

function GiftCardPreview({
  planName,
  deliveries,
  month,
  endMonth,
  recipient,
  sender,
  message,
  image,
}: {
  planName: string;
  deliveries: number;
  month: string;
  endMonth: string;
  recipient: string;
  sender: string;
  message: string;
  image: GiftPlan["image"];
}) {
  return (
    <figure aria-label="Gift card preview" className="relative overflow-hidden bg-cream px-8 pt-10 pb-9 text-center shadow-[0_30px_60px_-30px_rgba(42,34,29,0.35)] ring-1 ring-line-strong">
      {image && (
        <div className="relative mx-auto -mt-2 mb-2 h-36 w-40">
          <Image src={image.src} alt="" fill sizes="160px" className="object-contain object-bottom" />
        </div>
      )}
      {!image && <SprigMark size={34} className="mx-auto text-olive" />}
      <p className="t-eyebrow">A gift from Harlow Brook Flowers</p>
      <p className="mt-4 font-display text-[2rem] leading-tight">{planName}</p>
      <p className="mt-1 text-sm text-muted">
        {deliveries} Garden Bouquets{month ? ` · ${formatMonth(month)}–${formatMonth(endMonth)}` : ""}
      </p>
      <p className="mt-7 t-accent text-[1.45rem] leading-snug">For {recipient.trim() || "someone lovely"}</p>
      <p className="mx-auto mt-3 min-h-12 max-w-xs whitespace-pre-line text-[0.9375rem] leading-relaxed text-ink-soft">
        {message.trim() ? `“${message.trim()}”` : "Your message will appear here."}
      </p>
      <p className="mt-4 t-accent text-lg">with love, {sender.trim() || "you"}</p>
      <figcaption className="sr-only">Preview of the printable gift card</figcaption>
    </figure>
  );
}
