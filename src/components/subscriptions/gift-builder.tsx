"use client";

import { useId, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/components/cart/cart-provider";
import { cartStore } from "@/components/cart/cart-store";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";
import { DEFAULT_CARD_STYLE, type CardStyle } from "@/domain/gift-card";
import { CardPreview, DesignPicker, MessageField } from "./card-designer";
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
  const [cardStyle, setCardStyle] = useState<CardStyle>(DEFAULT_CARD_STYLE);
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
        cardStyle,
      },
    });
    announce(`${plan.name} for ${recipientName.trim()} added to your cart.`);
    if (thenCheckout) router.push("/checkout");
    else open();
  };

  const endMonth = month ? addMonths(month, plan.deliveries - 1) : "";

  return (
    <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
      <div className="space-y-12 lg:col-span-7">
        <fieldset>
          <legend className="t-h3">Choose a plan</legend>
          <div className="mt-5 border-y border-line">
            {plans.map((p) => {
              const selected = p.slug === plan.slug;
              return (
                <label
                  key={p.id}
                  className={cn(
                    "relative flex cursor-pointer items-start gap-4 border-b border-line py-5 pr-1 transition-colors last:border-b-0",
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
                  <span
                    aria-hidden
                    className={cn(
                      "mt-1.5 grid size-[1.125rem] shrink-0 place-items-center rounded-full border transition-colors peer-focus-visible:outline-[1.5px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink",
                      selected ? "border-ink" : "border-ink/35",
                    )}
                  >
                    <span className={cn("size-2 rounded-full bg-ink transition-transform", selected ? "scale-100" : "scale-0")} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-4">
                      <span className="font-display font-medium text-[1.375rem] leading-tight">{p.name}</span>
                      <span className="text-[1.0625rem] tabular-nums">{formatPrice(p.priceCents)}</span>
                    </span>
                    <span className="mt-1 block text-sm text-ink-soft">{p.tagline}</span>
                    <span className="mt-1 block text-[0.8125rem] text-muted">
                      {p.deliveries} Garden Bouquets, {formatPrice(Math.round(p.priceCents / p.deliveries))} each
                      {!p.available && " · Fully subscribed for this season"}
                      {p.available && p.remaining !== null && p.remaining <= 5 && ` · ${p.remaining} left this season`}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="space-y-5">
          <legend className="t-h3 mb-2">Who it&apos;s for</legend>
          <TextField
            id={`${id}-recipientName`}
            label="Their name"
            value={recipientName}
            maxLength={80}
            autoComplete="off"
            onChange={(e) => setRecipientName(e.target.value)}
            error={errors.recipientName}
          />
          <TextField
            id={`${id}-recipientEmail`}
            type="email"
            label="Their email"
            optional={!notifyRecipient}
            value={recipientEmail}
            maxLength={254}
            autoComplete="off"
            onChange={(e) => setRecipientEmail(e.target.value)}
            error={errors.recipientEmail}
            hint="So Sarah can send the pickup dates to them directly."
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

        <fieldset className="space-y-6">
          <legend className="t-h3 mb-2">Their card</legend>
          <p className="-mt-2 text-sm text-ink-soft">
            Choose a design and write your note. It goes on the printable card, and on their gift page if you send them the
            link. You can change it at checkout.
          </p>
          <DesignPicker name={`${id}-design`} value={cardStyle} onChange={setCardStyle} />
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
          <MessageField id={`${id}-message`} value={message} onChange={setMessage} />
        </fieldset>

        <fieldset>
          <legend className="t-h3">When it begins</legend>
          <div
            className="mt-5 inline-flex flex-wrap border border-line-strong"
            role="radiogroup"
            aria-describedby={errors.startMonth ? `${id}-sm-err` : undefined}
          >
            {plan.startMonths.map((m, i) => (
              <label key={m} className="cursor-pointer border-line-strong not-first:border-l">
                <input
                  id={i === 0 ? `${id}-startMonth` : undefined}
                  type="radio"
                  name={`${id}-month`}
                  className="peer sr-only"
                  checked={month === m}
                  onChange={() => setStartMonth(m)}
                />
                <span className="inline-flex h-11 items-center px-5 text-sm font-medium transition-colors peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:outline-[1.5px] peer-focus-visible:-outline-offset-4 peer-focus-visible:outline-paper hover:bg-ink/[0.045] peer-checked:hover:bg-ink">
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
            follow the growing season and are collected at the farm in Hartland.
          </p>
        </fieldset>
      </div>

      <aside className="lg:col-span-5">
        <div className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
          <figure aria-label="Gift card preview" className="bg-linen p-6 sm:p-10">
            <CardPreview
              design={cardStyle}
              image={plan.image?.src}
              planName={plan.name}
              detail={`${plan.deliveries} Garden Bouquets${month ? ` · ${formatMonth(month)} to ${formatMonth(endMonth)}` : ""}`}
              recipient={recipientName.trim() || "someone lovely"}
              message={message.trim() ? `“${message.trim()}”` : "Your message will appear here."}
              sender={senderName.trim() || "you"}
            />
            <figcaption className="mt-4 text-center text-[0.8125rem] text-muted">
              Your printable gift card, ready after checkout.
            </figcaption>
          </figure>
          <div className="mt-6 border-t border-line pt-6">
            <p className="flex items-baseline justify-between gap-4">
              <span className="font-display font-medium text-[1.25rem]">{plan.name}</span>
              <span className="text-[1.125rem] tabular-nums">{formatPrice(plan.priceCents)}</span>
            </p>
            <p className="mt-1 text-sm text-muted">One payment. No renewals, no account.</p>
            <div className="mt-5 grid gap-3">
              <Button size="lg" onClick={() => add(true)} disabled={!plan.available}>
                Continue to checkout
              </Button>
              <Button variant="secondary" size="lg" onClick={() => add(false)} disabled={!plan.available}>
                Add to cart and keep shopping
              </Button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
